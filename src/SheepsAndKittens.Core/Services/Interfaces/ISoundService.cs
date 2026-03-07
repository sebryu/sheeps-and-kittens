using System.Threading.Tasks;

namespace SheepsAndKittens.Core.Services.Interfaces
{
    public enum SoundName
    {
        Select,
        Place,
        Move,
        Capture,
        Win,
        Invalid
    }

    public interface ISoundService
    {
        Task LoadAllSoundsAsync();
        Task PlaySoundAsync(SoundName name);
        Task UnloadAllSoundsAsync();
    }
}
