import { useLocalSearchParams, useRouter } from "expo-router"
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { getMangaDetails } from "../../../services/WorkService"
import Checkbox from "expo-checkbox"
import { AiOutlineHeart } from "react-icons/ai" // 💡 Si tu es sur React Native Web ou Expo Web
// Sinon, pour Expo natif, utilise un package comme `react-native-vector-icons`

const WorkDetails = () => {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const [work, setWork] = useState<any>(null)
    const [readChapters, setReadChapters] = useState<number[]>([])

    useEffect(() => {
        const fetchWork = async () => {
            try {
                const res = await getMangaDetails(Number(id))
                setWork(res)
            } catch (err) {
                console.error("Erreur :", err)
            }
        }

        fetchWork()
    }, [id])

    const toggleChapter = (chapterNumber: number) => {
        setReadChapters((prev) =>
            prev.includes(chapterNumber)
                ? prev.filter((num) => num !== chapterNumber)
                : [...prev, chapterNumber]
        )
    }

    const handleFavorite = async (workId: number) => {
        // 🔒 Remplace ici par ton service côté API
        try {
            console.log("Ajouté aux favoris :", workId)
            // await addToFavorites(workId)
        } catch (err) {
            console.error("Erreur favori :", err)
        }
    }

    if (!work) return <Text className="p-4">Chargement...</Text>

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-4">
                {/* Bouton retour */}
                <TouchableOpacity
                    onPress={() => router.push("/home")}
                    className="mb-4 self-start bg-blue-500 px-4 py-2 rounded"
                >
                    <Text className="text-white font-semibold">⬅️ Retour</Text>
                </TouchableOpacity>

                {/* Contenu principal */}
                <View className="flex-col md:flex-row bg-white rounded-lg p-4 shadow-md">
                    {/* Partie gauche */}
                    <View className="w-full md:w-1/3 mb-6 md:mb-0 md:mr-8 relative">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-bold flex-1">{work.title}</Text>
                            <TouchableOpacity onPress={() => handleFavorite(work.id)}>
                                <AiOutlineHeart className="text-3xl text-red-500" />
                            </TouchableOpacity>
                        </View>

                        <Image
                            source={{ uri: work.coverUrl }}
                            className="w-40 h-60 rounded mb-4"
                            resizeMode="cover"
                        />


                        <Text className="text-base text-gray-700">{work.description}</Text>
                    </View>

                    {/* Partie droite */}
                    <View className="w-full md:w-2/3">
                        <Text className="text-xl font-semibold mb-4 text-gray-800">
                            📚 Chapitres ({work.totalChapters})
                        </Text>

                        <View className="flex flex-wrap gap-y-2 gap-x-4">
                            {[...Array(work.totalChapters)]
                                .map((_, index) => work.totalChapters - index)
                                .map((chapterNum) => {
                                    const isChecked = readChapters.includes(chapterNum)
                                    return (
                                        <View
                                            key={chapterNum}
                                            className="flex-row items-center w-1/2"
                                        >
                                            <Checkbox
                                                value={isChecked}
                                                onValueChange={() => toggleChapter(chapterNum)}
                                                color={isChecked ? "#22c55e" : undefined}
                                            />
                                            <Text className="ml-2 text-base text-gray-800">
                                                Chapitre {chapterNum}
                                            </Text>
                                        </View>
                                    )
                                })}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default WorkDetails
