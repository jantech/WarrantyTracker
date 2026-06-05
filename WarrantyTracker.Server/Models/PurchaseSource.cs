using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarrantyTracker.Server.Models
{
    [Table("purchase_sources")]
    public class PurchaseSource
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(128)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        public ICollection<UserWarrantyRegister> WarrantyRegistrations { get; set; } = new List<UserWarrantyRegister>();

    }
}
