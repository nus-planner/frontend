const chatIds = [29777902, 114197355, 791579048, 851941272]

export const postFeedback = async (message: string) => {
  for (let chatId of chatIds) {
    fetch(
      `https://api.telegram.org/bot5597970230:AAGfH4mNIFh899VSmovC2PSWyjgq28Se_-s/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
        message,
      )}`,
    );
  }
};
