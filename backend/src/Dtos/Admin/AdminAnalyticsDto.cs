namespace task_manager_api.Models.DTO
{
    public class AdminAnalyticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalProjects { get; set; }
        public int TotalTasks { get; set; }

        public int TodoTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int DoneTasks { get; set; }

        public int ApprovedTasks { get; set; }
        public int NeedsRevisionTasks { get; set; }
        public int RejectedTasks { get; set; }
        public int SubmittedTasks { get; set; }
    }
}
