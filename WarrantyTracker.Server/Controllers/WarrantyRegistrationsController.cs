using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarrantyTracker.Server.Data;
using WarrantyTracker.Server.Dto;
using WarrantyTracker.Server.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WarrantyTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WarrantyRegistrationsController : ControllerBase
    {
        private readonly ILogger<WarrantyRegistrationsController> _logger;
        private readonly AppDbContext _appDbContext;
        private readonly IWebHostEnvironment _environment;

        public WarrantyRegistrationsController(ILogger<WarrantyRegistrationsController> logger,
                                                AppDbContext appDbContext,
                                                IWebHostEnvironment environment)
        {
            _logger = logger;
            _appDbContext = appDbContext;
            _environment = environment;
        }

        // GET: api/<WarrantyRegistrationsController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _appDbContext.UserWarrantyRegisters
                                            .Include(w => w.Device)
                                                .ThenInclude(d => d.Brand)
                                            .Include(w => w.PurchaseSource)
                                            .Select(w => new
                                            {
                                                w.Id,
                                                w.OwnerName,
                                                w.EmailAddress,
                                                w.MobileNumber,
                                                DeviceName = w.Device.Name,
                                                BrandName = w.Device.Brand.Name,
                                                w.Device.ModelNumber,
                                                PurchaseSource = w.PurchaseSource != null ? w.PurchaseSource.Name : null,
                                                w.PurchaseDate,
                                                w.WarrantyStart,
                                                w.InvoiceFile,
                                                w.Notes
                                            })
                                            .ToListAsync();

            return Ok(result);
        }

        // GET api/<WarrantyRegistrationsController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(long id)
        {
            var result = await _appDbContext.UserWarrantyRegisters
                                            .Include(w => w.Device)
                                                .ThenInclude(d => d.Brand)
                                            .Include(w => w.PurchaseSource)
                                            .Where(w => w.Id == id)
                                            .Select(w => new
                                            {
                                                w.Id,
                                                w.OwnerName,
                                                w.EmailAddress,
                                                w.MobileNumber,
                                                DeviceName = w.Device.Name,
                                                BrandName = w.Device.Brand.Name,
                                                w.Device.ModelNumber,
                                                PurchaseSource = w.PurchaseSource != null ? w.PurchaseSource.Name : null,
                                                w.PurchaseDate,
                                                w.WarrantyStart,
                                                w.InvoiceFile,
                                                w.Notes
                                            })
                                            .FirstOrDefaultAsync();

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // GET: api/warrantyregistrations/mobile/9876543210
        [HttpGet("mobile/{mobileNumber}")]
        public async Task<IActionResult> GetByMobileNumber(string mobileNumber)
        {
            var result = await _appDbContext.UserWarrantyRegisters
                                            .Include(w => w.Device)
                                                .ThenInclude(d => d.Brand)
                                            .Include(w => w.PurchaseSource)
                                            .Where(w => w.MobileNumber == mobileNumber)
                                            .Select(w => new
                                            {
                                                w.Id,
                                                w.OwnerName,
                                                w.EmailAddress,
                                                w.MobileNumber,
                                                DeviceName = w.Device.Name,
                                                BrandName = w.Device.Brand.Name,
                                                w.Device.ModelNumber,
                                                PurchaseSource = w.PurchaseSource != null ? w.PurchaseSource.Name : null,
                                                w.PurchaseDate,
                                                w.WarrantyStart,
                                                w.InvoiceFile,
                                                w.Notes
                                            })
                                            .ToListAsync();

            if (!result.Any())
            {
                return NotFound();
            }

            return Ok(result);
        }


        // POST api/<WarrantyRegistrationsController>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Post([FromForm] CreateWarrantyRegistrationRequest request)
        {
            // ==================================================
            // Validate Device
            // ==================================================

            var device = await _appDbContext.Devices
                .Include(d => d.Brand)
                .FirstOrDefaultAsync(d => d.Id == request.DeviceId);

            if (device == null)
            {
                return BadRequest(new
                {
                    Message = "Selected device does not exist."
                });
            }

            // ==================================================
            // Validate Purchase Source
            // ==================================================

            if (request.PurchaseSourceId.HasValue)
            {
                var purchaseSourceExists = await _appDbContext.PurchaseSources.AnyAsync(x => x.Id == request.PurchaseSourceId.Value);

                if (!purchaseSourceExists)
                {
                    return BadRequest(new
                    {
                        Message = "Selected purchase source does not exist."
                    });
                }
            }

            // ==================================================
            // Validate Purchase Date
            // ==================================================

            if (request.PurchaseDate.Date > DateTime.Today)
            {
                return BadRequest(new
                {
                    Message = "Purchase date cannot be a future date."
                });
            }

            // ==================================================
            // Registration must happen within 30 days
            // ==================================================

            var daysSincePurchase = (DateTime.Today - request.PurchaseDate.Date).Days;

            if (daysSincePurchase > 30)
            {
                return BadRequest(new
                {
                    Message =
                        "Warranty registration must be completed within 30 days of purchase."
                });
            }

            // ==================================================
            // Duplicate Validation
            // ==================================================

            var alreadyRegistered = await _appDbContext.UserWarrantyRegisters
                                                        .AnyAsync(x => x.MobileNumber == request.MobileNumber &&
                                                                        x.DeviceId == request.DeviceId && 
                                                                        x.PurchaseDate == request.PurchaseDate &&
                                                                        x.PurchaseSourceId == request.PurchaseSourceId);

            if (alreadyRegistered)
            {
                return Conflict(new
                {
                    Message =
                        "This device is already registered for the given mobile number."
                });
            }

            // ==================================================
            // Invoice Upload Validation
            // ==================================================

            string? invoiceFilePath = null;

            if (request.InvoiceFile != null)
            {
                var allowedExtensions = new[]
                {
                ".pdf",
                ".jpg",
                ".jpeg",
                ".png"
            };

                var extension = Path.GetExtension(request.InvoiceFile.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new
                    {
                        Message =
                            "Only PDF, JPG, JPEG and PNG files are allowed."
                    });
                }

                const long maxFileSize = 2 * 1024 * 1024;

                if (request.InvoiceFile.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        Message =
                            "Maximum allowed file size is 2 MB."
                    });
                }

                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "invoices");

                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{extension}";

                var filePath = Path.Combine(uploadsFolder, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);

                await request.InvoiceFile.CopyToAsync(stream);

                invoiceFilePath = $"/uploads/invoices/{fileName}";
            }

            // ==================================================
            // Warranty Start
            // ==================================================

            var warrantyStart = request.PurchaseDate;

            // ==================================================
            // Create Registration
            // ==================================================

            var registration =
                new UserWarrantyRegister
                {
                    OwnerName = request.OwnerName,
                    EmailAddress = request.EmailAddress,
                    MobileNumber = request.MobileNumber,

                    DeviceId = request.DeviceId,
                    PurchaseSourceId = request.PurchaseSourceId,

                    PurchaseDate = request.PurchaseDate,
                    WarrantyStart = warrantyStart,

                    InvoiceFile = invoiceFilePath,
                    Notes = request.Notes,

                    CreatedAt = DateTime.UtcNow
                };

            _appDbContext.UserWarrantyRegisters.Add(registration);

            await _appDbContext.SaveChangesAsync();

            // ==================================================
            // Calculate Warranty End
            // ==================================================

            var warrantyEnd = warrantyStart.AddMonths(device.WarrantyMonths);

            return CreatedAtAction(
                nameof(Get),
                new { id = registration.Id },
                new
                {
                    registration.Id,
                    registration.OwnerName,
                    registration.MobileNumber,

                    Brand = device.Brand.Name,
                    Device = device.Name,
                    device.ModelNumber,

                    registration.PurchaseDate,
                    registration.WarrantyStart,

                    device.WarrantyMonths,

                    WarrantyEnd = warrantyEnd,

                    registration.InvoiceFile,

                    Message = "Warranty registered successfully."
                });
        }

        // PUT api/<WarrantyRegistrationsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<WarrantyRegistrationsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
