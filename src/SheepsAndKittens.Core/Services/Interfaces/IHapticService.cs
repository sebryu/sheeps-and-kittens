using System.Threading.Tasks;

namespace SheepsAndKittens.Core.Services.Interfaces
{
    public enum HapticEvent
    {
        Select,
        Place,
        Move,
        Capture,
        Win,
        Invalid,
        PhaseChange
    }

    public interface IHapticService
    {
        Task TriggerHapticAsync(HapticEvent hapticEvent);
    }
}
