using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarrantyTracker.Server.Models
{
    [Table("user_warranty_register")]
    public class UserWarrantyRegister
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [StringLength(128)]
        [Column("owner_name")]
        public string OwnerName { get; set; } = string.Empty;

        [StringLength(100)]
        [Column("email_address")]
        public string? EmailAddress { get; set; }

        [Required]
        [StringLength(15)]
        [Column("mobile_number")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("purchase_source_id")]
        public int? PurchaseSourceId { get; set; }

        [Required]
        [Column("purchase_date")]
        public DateTime PurchaseDate { get; set; }

        [Required]
        [Column("warranty_start")]
        public DateTime WarrantyStart { get; set; }

        [StringLength(255)]
        [Column("invoice_file")]
        public string? InvoiceFile { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation Properties

        [ForeignKey(nameof(ProductId))]
        public Product Product { get; set; } = null!;

        [ForeignKey(nameof(PurchaseSourceId))]
        public PurchaseSource? PurchaseSource { get; set; }
    }
}
