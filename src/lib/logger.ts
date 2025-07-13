
'use client';

export type LogStatus = 'Success' | 'Failure';

export type LogActionType = 
  | 'File Upload' 
  | 'File Delete' 
  | 'Folder Create' 
  | 'Folder Delete' 
  | 'Login' 
  | 'Logout'
  | 'FAQ Update'
  | 'Roadmap Update'
  | 'Creators Update'
  | 'Notes Update'
  | 'Hero Update'
  | 'Advantages Update'
  | 'Product Update'
  | 'Action Section Update'
  | 'Pages Update'
  | 'Maintenance Mode'
  | 'Reactions Reset';

export type LogEntry = {
  id: string;
  timestamp: number;
  user: string;
  action: LogActionType;
  status: LogStatus;
  details: string;
  path?: string;
};

const LOG_STORAGE_KEY = 'spekulus-action-logs';

const getCurrentUser = (): string => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('admin_user') || 'System';
    }
    return 'System';
};

export const getLogs = (): LogEntry[] => {
    if (typeof window !== 'undefined') {
        try {
            const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
            return storedLogs ? JSON.parse(storedLogs) : [];
        } catch (error) {
            console.error("Failed to retrieve logs:", error);
            return [];
        }
    }
    return [];
};

export const logAction = (
    action: LogActionType,
    status: LogStatus,
    details: string,
    path?: string
) => {
    if (typeof window !== 'undefined') {
        try {
            const logs = getLogs();
            const newLog: LogEntry = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                user: getCurrentUser(),
                action,
                status,
                details,
                path,
            };
            const updatedLogs = [newLog, ...logs];
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
            // Dispatch a storage event to notify other tabs/windows
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Failed to write log:", error);
        }
    }
};
