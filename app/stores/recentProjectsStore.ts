import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/app/types';

interface RecentProject extends Project {
  lastViewed: string;
}

interface Store {
  recentProjects: RecentProject[];
  addProject: (project: Project) => void;
}

const useRecentProjectsStore = create<Store>()(
  persist(
    (set) => ({
      recentProjects: [],
      
      addProject: (project) => set((state) => ({
        recentProjects: [
          { ...project, lastViewed: new Date().toISOString() },
          ...state.recentProjects.filter(p => p.id !== project.id)
        ].slice(0, 5)
      })),
    }),
    {
      name: 'recent-projects-storage', 
    }
  )
);

export default useRecentProjectsStore;
