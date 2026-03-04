import { useCallback, useState } from "react";
import { Alert } from "react-native";

// const API_URL = "http://localhost:8082/api";
const API_URL = "'https://wallet-rn-1.onrender.com/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // useCallback - memorize the function (performance usage)
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/sumary/${userId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // functions can run in parallel
      await Promise.all([fetchTransactions(), fetchSummary()]);
      // these are called separately, in order
      // await fetchTransactions()
      // await fetchSummary()
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");

      // refresh data after deletion
      loadData();
      Alert.alert("Succes", "Transaction deleted successfully");
    } catch (error) {
      console.error("Error fetching summary:", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
