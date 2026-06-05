using Microsoft.EntityFrameworkCore;
using WarrantyTracker.Server.Models;

namespace WarrantyTracker.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<PurchaseSource> PurchaseSources { get; set; }
        public DbSet<UserWarrantyRegister> UserWarrantyRegisters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
