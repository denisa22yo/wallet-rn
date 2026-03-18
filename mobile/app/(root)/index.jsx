import { useSession, useUser } from "@clerk/clerk-expo";
import {
  Alert,
  FlatList,
  StatusBar,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTransactions } from "../../hooks/useTransactions";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { SignOutButton } from "@/components/SignOutButton";
import { TransactionItem } from "@/components/TransactionItem";
import { BalanceCard } from "../../components/BalanceCard";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import { THEMES } from "../../constants/colors";

export default function Page() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // STATE doar pentru tema curentă
  const [currentTheme, setCurrentTheme] = useState(THEMES.ocean);

  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user?.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && user?.id) {
        loadData();
      }
    }, [isLoaded, user?.id, loadData]),
  );

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTransaction(id);
          loadData();
        },
      },
    ]);
  };

  if (!isLoaded || (isLoading && !refreshing)) return <PageLoader />;

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* STATUS BAR DINAMIC */}
      <StatusBar
        style={
          currentTheme.background === "#FFF8F3" ||
          currentTheme.background === "#FFFFFF"
            ? "dark"
            : "light"
        }
        backgroundColor={currentTheme.background}
      />

      <View style={styles.content}>
        {/* HEADER */}
        <View style={[styles.header, { marginBottom: 5 }]}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text
                style={[styles.welcomeText, { color: currentTheme.textLight }]}
              >
                Welcome,
              </Text>
              <Text style={[styles.usernameText, { color: currentTheme.text }]}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0] || "User"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Buton ADD circular (+) - Dimensiune redusă */}
            <TouchableOpacity
              style={{
                backgroundColor: currentTheme.primary,
                width: 38,
                height: 38,
                borderRadius: 19,
                justifyContent: "center",
                alignItems: "center",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
              }}
              onPress={() => router.push("/create")}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>

            <SignOutButton />
          </View>
        </View>

        {/* SELECTOR TEME PERMANENT (MĂRIMI REDUSE) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center", // Centrat pe ecran
            gap: 20, // Spațiu fix între emoticoane
            paddingVertical: 6, // Padding vertical micșorat
            paddingHorizontal: 15,
            backgroundColor: currentTheme.card,
            borderRadius: 20,
            alignSelf: "center", // Containerul se strânge în jurul conținutului
            marginBottom: 15, // Spațiu redus sub container
            borderWidth: 1,
            borderColor: currentTheme.border,
            elevation: 1, // Umbră mai subtilă
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
          }}
        >
          <TouchableOpacity
            onPress={() => setCurrentTheme(THEMES.coffee)}
            style={{ padding: 2 }}
          >
            <Text style={{ fontSize: 22 }}>☕</Text> {/* Font size redus */}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTheme(THEMES.forest)}
            style={{ padding: 2 }}
          >
            <Text style={{ fontSize: 22 }}>🌲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTheme(THEMES.purple)}
            style={{ padding: 2 }}
          >
            <Text style={{ fontSize: 22 }}>🔮</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTheme(THEMES.ocean)}
            style={{ padding: 2 }}
          >
            <Text style={{ fontSize: 22 }}>🌊</Text>
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <BalanceCard summary={summary} theme={currentTheme} />

        <View style={styles.transactionsHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Recent Transactions
          </Text>
        </View>
      </View>

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onDelete={handleDelete}
            theme={currentTheme}
          />
        )}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
          />
        }
      />
    </View>
  );
}
