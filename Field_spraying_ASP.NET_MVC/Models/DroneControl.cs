namespace Field_spraying_ASP.NET_MVC.Models
{
    public class DroneControl
    {
        public string WorkPlanName {  get; set; }

        public CoverageTrajectory Trajectory { get; set; }

        public Point LoadingPoint { get; set; }

        public Drone Drone { get; set; }

        public DroneType DroneType { get; set; }

        public int LastTrajectoryPointVisitedIndex { get; set; }

        public double[] CurrentDronePosition { get; set; }

        public float CurrentDroneTankVolume { get; set; }

        public double CurrentDroneSpeed { get; set; }

        public DateTime LastCallTime { get; set; }

        // Drone acceleration
        public double a = 2;

        // Is drone currently braking
        public bool nowBraking = false;

        public int IndexIncrement = 1;

        public DroneControl(string workPlanName, CoverageTrajectory trajectory, Point loadingPoint, Drone drone, DroneType droneType, int lastTrajectoryPointVisitedIndex, double[] currentDronePosition, float currentDroneTankVolume, double currentDroneSpeed, DateTime lastCallTime)
        {
            WorkPlanName = workPlanName;
            Trajectory = trajectory;
            LoadingPoint = loadingPoint;
            Drone = drone;
            DroneType = droneType;
            LastTrajectoryPointVisitedIndex = lastTrajectoryPointVisitedIndex;
            CurrentDronePosition = currentDronePosition;
            CurrentDroneTankVolume = currentDroneTankVolume;
            CurrentDroneSpeed = currentDroneSpeed;
            LastCallTime = lastCallTime;
        }
    }
}
