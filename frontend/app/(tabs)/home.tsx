import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"      // FiSearch équivalent
import { AntDesign } from "@expo/vector-icons"    // Cœur

const Home = () => {
    const router = useRouter()

    return (
        <View className="flex-1 bg-white p-6 relative">
            {/* 🔍 Bouton recherche en haut à gauche */}
            <TouchableOpacity
                onPress={() => router.push("/search")}
                className="absolute top-4 left-4"
            >
                <Feather name="search" size={28} color="black" />
            </TouchableOpacity>

            {/* ❤️ Bouton favoris en haut à droite */}
            <TouchableOpacity
                onPress={() => router.push("/favorites")}
                className="absolute top-4 right-4"
            >
                <AntDesign name="hearto" size={28} color="red" />
            </TouchableOpacity>

            {/* Contenu principal */}
            <View className="flex-1 items-center justify-center">
                <Text className="text-4xl font-bold mb-4 text-center">
                    Welcome to the Home Page
                </Text>
                <Text className="text-lg text-center">This is the main content area.</Text>
            </View>
        </View>
    )
}

export default Home
