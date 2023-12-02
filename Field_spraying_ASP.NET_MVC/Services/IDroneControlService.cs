using Field_spraying_ASP.NET_MVC.Models;

namespace Field_spraying_ASP.NET_MVC.Services
{
    public interface IDroneControlService
    {
        double[] GetCurrentDronePosition(string workPlanName);
        void InitWorkPlanSimulation(WorkPlan workPlan);
        void StopWorkPlanSimulation(string workPlanName);
    }
}