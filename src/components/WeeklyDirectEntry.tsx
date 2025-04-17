
          // Then save the new entries
          entryRows.forEach(row => {
            Object.entries(row.hours).forEach(([date, hours]) => {
              const hoursValue = parseFloat(hours);
              if (hoursValue > 0) {
                addTimeEntry({
                  date,
                  project: row.project,
                  task: row.task,
                  hours: hoursValue,
                  notes: row.notes || "",
                  customerId: row.project, // Assuming project ID is the customer ID for backward compatibility
                  projectId: row.project,
                  description: row.notes || "",
                });
              }
            });
          });
