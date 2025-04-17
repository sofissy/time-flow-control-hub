
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
