using MvvmCross;
using MvvmCross.ViewModels;
using SheepsAndKittens.Core.ViewModels;

namespace SheepsAndKittens.Core
{
    public class App : MvxApplication
    {
        public override void Initialize()
        {
            RegisterAppStart<WelcomeViewModel>();
        }
    }
}
