using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarrantyTracker.Server.Models
{
    [Table("devices")]
    public class Device
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [StringLength(128)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("brand_id")]
        public int BrandId { get; set; }

        [StringLength(50)]
        [Column("model_number")]
        public string? ModelNumber { get; set; }

        [Required]
        [Column("warranty_months")]
        public int WarrantyMonths { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation Property
        [ForeignKey(nameof(BrandId))]
        public Brand Brand { get; set; } = null!;

        public ICollection<UserWarrantyRegister> WarrantyRegistrations { get; set; } = new List<UserWarrantyRegister>();

    }
}
