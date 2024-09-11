import React from 'react';
import ConfirmProceedDialog from './ConfirmProceedDialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const ArticleTrash = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTrashClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleProceed = () => {
    // Perform the trash action here

    setIsDialogOpen(false);
  };

  return (
    <>
      <ButtonMain onClick={handleTrashClick}>Trash</ButtonMain>
      {isDialogOpen && (
        <ConfirmProceedDialog
          onClose={handleDialogClose}
          onProceed={handleProceed}
        />
      )}
    </>
  );
};

export default ArticleTrash;