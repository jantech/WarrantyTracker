using System.ComponentModel.DataAnnotations;

namespace WarrantyTracker.Server.Dto
{
    public class CreateWarrantyRegistrationRequest
    {
        [Required]
        [StringLength(128)]
        public string OwnerName { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(100)]
        public string? EmailAddress { get; set; }

        [Required]
        [StringLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        public int DeviceId { get; set; }

        public int? PurchaseSourceId { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; }

        public string? Notes { get; set; }

        public IFormFile? InvoiceFile { get; set; }
    }
}
