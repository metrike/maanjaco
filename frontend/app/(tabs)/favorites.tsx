import { useEffect, useState } from "react"
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import {getFavoriteMangas} from "../../services/WorkService";

const Favorites = () => {
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await getFavoriteMangas()
                setFavorites(data)
            } catch (err) {
                console.error("❌ Erreur chargement favoris :", err)
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [])

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-500">Chargement des favoris...</Text>
            </View>
        )
    }

    if (favorites.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-4">
                <Text className="text-xl font-semibold text-gray-600">
                    Aucun manga en favori 🥲
                </Text>
            </View>
        )
    }

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-6 space-y-4">
            {favorites.map((work) => (
                <TouchableOpacity
                    key={work.id}
                    onPress={() => router.push(`/work-details/${work.id}`)}
                    className="flex-row bg-gray-50 rounded-lg shadow p-4 space-x-4"
                >
                    <Image
                        source={{ uri: work.cover_url }}
                        className="w-24 h-36 rounded bg-gray-200"
                        resizeMode="cover"
                    />
                    <View className="flex-1 justify-between">
                        <Text className="text-xl font-bold text-gray-800">{work.title}</Text>
                        <Text className="text-gray-500 text-sm mt-2">
                            📚 {work.total_chapters || 0} chapitre(s)
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}

export default Favorites
