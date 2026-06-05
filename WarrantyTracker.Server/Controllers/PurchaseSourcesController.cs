using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarrantyTracker.Server.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WarrantyTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseSourcesController : ControllerBase
    {
        private readonly ILogger<PurchaseSourcesController> _logger;
        private readonly AppDbContext _appDbContext;

        public PurchaseSourcesController(ILogger<PurchaseSourcesController> logger,
                                AppDbContext appDbContext)
        {
            _logger = logger;
            _appDbContext = appDbContext;
        }


        // GET: api/<PurchaseSourcesController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _appDbContext.PurchaseSources.Select(b => new { b.Id, b.Name }).ToListAsync();

            return Ok(result);
        }

        // GET api/<PurchaseSourcesController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _appDbContext.PurchaseSources
                                            .Where(b => b.Id == id)
                                            .Select(b => new { b.Id, b.Name })
                                            .FirstOrDefaultAsync();

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // POST api/<PurchaseSourcesController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<PurchaseSourcesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<PurchaseSourcesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
