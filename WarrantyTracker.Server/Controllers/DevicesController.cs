using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using WarrantyTracker.Server.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WarrantyTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DevicesController : ControllerBase
    {
        private readonly ILogger<DevicesController> _logger;
        private readonly AppDbContext _appDbContext;

        public DevicesController(ILogger<DevicesController> logger,
                                AppDbContext appDbContext)
        {
            _logger = logger;
            _appDbContext = appDbContext;
        }

        // GET: api/<DevicesController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _appDbContext.Devices
                                            .Include(d => d.Brand)
                                            .Select(d => new
                                            {
                                                d.Id,
                                                d.Name,
                                                Brand = d.Brand.Name,
                                                d.ModelNumber,
                                                d.WarrantyMonths
                                            }).ToListAsync();

            return Ok(result);
        }

        // GET api/<DevicesController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _appDbContext.Devices
                                            .Include(d => d.Brand)
                                            .Where(d => d.Id == id)
                                            .Select(d => new
                                            {
                                                d.Id,
                                                d.Name,
                                                Brand = d.Brand.Name,
                                                d.ModelNumber,
                                                d.WarrantyMonths
                                            })
                                            .FirstOrDefaultAsync();

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // GET: api/devices/search?name=galaxy
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Device name is required.");
            }

            var result = await _appDbContext.Devices
                                            .Include(d => d.Brand)
                                            .Where(d => d.Name.Contains(name))
                                            .Select(d => new
                                            {
                                                d.Id,
                                                d.Name,
                                                Brand = d.Brand.Name,
                                                d.ModelNumber,
                                                d.WarrantyMonths
                                            })
                                            .ToListAsync();

            return Ok(result);
        }


        // POST api/<DevicesController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<DevicesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<DevicesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
