import { useMemo } from "react";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { ServiceJob } from "@/types/firebase";

export function useOverdueJobs() {
  const { data: serviceJobs, loading, error } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const overdueJobs = useMemo(() => {
    if (!serviceJobs) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return serviceJobs.filter((job) => {
      // Ignore completed jobs
      if (job.status === "Completed") return false;
      
      // If no expected date is set, it can't be overdue
      if (!job.expectedDate) return false;

      const expectedDate = new Date(job.expectedDate);
      
      // Check if the expected date is in the past
      return expectedDate < today;
    });
  }, [serviceJobs]);

  return {
    overdueJobs,
    loading,
    error,
    count: overdueJobs.length
  };
}
