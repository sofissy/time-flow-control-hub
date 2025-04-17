
  const handleUpdateWeekStatus = (status: string) => {
    updateWeekStatus(weekStartISO, status);
    toast({
      title: `Timesheet ${status}`,
      description: `Timesheet has been ${status} successfully`,
    });
  };
