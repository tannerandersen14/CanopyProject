import axios from "axios";
const baseURL = "http://deckofcardsapi.com/api/deck/";

const handleError = (err) => {
  // Unexpected error from network request - should be handled with a toast or some other notification to the user.
  console.error(err);
  return err;
};

export const createNewDeck = async () => {
  const response = await axios.get(`${baseURL}/new/shuffle`).catch(handleError);
  return response.data;
};

export const drawCardsFromDeck = async (deckId, count = 1) => {
  const response = await axios
    .get(`${baseURL}/${deckId}/draw/?count=${count}`)
    .catch(handleError);
  return response.data;
};

export const shuffleExistingDeck = async (deckId) => {
  const response = await axios
    .get(`${baseURL}/${deckId}/shuffle/`)
    .catch(handleError);
  return response.data;
};
