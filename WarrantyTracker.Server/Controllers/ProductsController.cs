using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarrantyTracker.Server.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WarrantyTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly AppDbContext _appDbContext;

        public ProductsController(ILogger<ProductsController> logger,
                                AppDbContext appDbContext)
        {
            _logger = logger;
            _appDbContext = appDbContext;
        }

        // GET: api/<ProductsController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _appDbContext.Products
                                            .Select(p => new
                                            {
                                                p.Id,
                                                p.Name,
                                                p.Category,
                                                p.ModelNumber,
                                                p.WarrantyMonths
                                            }).ToListAsync();

            return Ok(result);
        }

        // GET api/<ProductsController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _appDbContext.Products
                                            .Where(p => p.Id == id)
                                            .Select(p => new
                                            {
                                                p.Id,
                                                p.Name,
                                                p.Category,
                                                p.ModelNumber,
                                                p.WarrantyMonths
                                            })
                                            .FirstOrDefaultAsync();

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // GET: api/products/search?name=panel
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Product name is required.");
            }

            var result = await _appDbContext.Products
                                            .Where(p => p.Name.Contains(name))
                                            .Select(p => new
                                            {
                                                p.Id,
                                                p.Name,
                                                p.Category,
                                                p.ModelNumber,
                                                p.WarrantyMonths
                                            })
                                            .ToListAsync();

            return Ok(result);
        }
    }
}
