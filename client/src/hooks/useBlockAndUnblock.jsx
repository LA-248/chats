export default function useBlockAndUnblock({
  blockList,
  activeChat,
  setBlockList,
  updateBlockList,
  setIsBlocked,
  setErrorMessage,
}) {
  const handleBlockAndUnblock = async () => {
    try {
      // Handle blocking a user
      if (!blockList.includes(activeChat.recipient_id)) {
        // Add recipient id to block list array
        const updatedBlockList = [...blockList, activeChat.recipient_id];
        setBlockList(updatedBlockList);
        await updateBlockList(updatedBlockList);
        setIsBlocked(true);
      } else {
        // Handle unblocking a user
        const updatedBlockList = blockList.filter(
          (id) => id !== activeChat.recipient_id
        );
        setBlockList(updatedBlockList);
        await updateBlockList(updatedBlockList);
        setIsBlocked(false);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Return as an object so more functions or values can be added in the future
  return { handleBlockAndUnblock };
}
