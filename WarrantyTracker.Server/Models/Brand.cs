using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarrantyTracker.Server.Models
{
    [Table("brands")]
    public class Brand
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [StringLength(128)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation Property
        public ICollection<Device> Devices { get; set; } = new List<Device>();
    }
}
