import { useLocalSearchParams, useRouter } from "expo-router"
import { Text, View, Image, ScrollView, TouchableOpacity, Modal } from "react-native"
import { useEffect, useState } from "react"
import {getMangaDetails, getSearchImages} from "../../../services/WorkService"
import Checkbox from "expo-checkbox"
import { AiOutlineHeart } from "react-icons/ai"
import { AiFillTool } from "react-icons/ai"
import { useAuth } from "../../../provider/AuthProvider"

const WorkDetails = () => {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const [work, setWork] = useState<any>(null)
    const [readChapters, setReadChapters] = useState<number[]>([])
    const [isAdminModalVisible, setIsAdminModalVisible] = useState(false)
    const [images, setImages] = useState<string[]>([])

    const { isAdmin } = useAuth()

    useEffect(() => {
        const fetchWork = async () => {
            try {
                const res = await getSearchImages(Number(id))
                console.log(res)
                setImages(res.images)
            } catch (err) {
                console.error("Erreur :", err)
            }
        }

        fetchWork()
    }, [id])

    useEffect(() => {
        const fetchImages = async () => {
            try {

                const res = await getMangaDetails(Number(id))
                console.log(res)
                setWork(res)
            } catch (err) {
                console.error("Erreur :", err)
            }
        }

        fetchImages()
    }, [isAdminModalVisible])

    const toggleChapter = (chapterNumber: number) => {
        setReadChapters((prev) =>
            prev.includes(chapterNumber)
                ? prev.filter((num) => num !== chapterNumber)
                : [...prev, chapterNumber]
        )
    }

    const handleFavorite = async (workId: number) => {
        try {
            console.log("Ajouté aux favoris :", workId)
        } catch (err) {
            console.error("Erreur favori :", err)
        }
    }

    // if (!work) return <Text className="p-4">Chargement...</Text>
    // const chapterCount = typeof work.totalChapters === "number" ? work.totalChapters : 0

    const handleCoverUpdate=async (newCoverUrl: string) => {
        // try {
        //     setWork((prev: any) => ({ ...prev, coverUrl: newCoverUrl }))
        //     setIsAdminModalVisible(false)
        //     // Optionnel : Envoyer la mise à jour au backend
        //     // await updateWorkCover(work.id, newCoverUrl)
        // } catch (err) {
        //     console.error("Erreur lors de la mise à jour de la couverture :", err)
        // }
    }
    const chapterCount = typeof work?.totalChapters === "number" ? work?.totalChapters : 0

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-4">
                {/* Bouton retour + icône admin */}
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity
                        onPress={() => router.push("/home")}
                        className="bg-blue-500 px-4 py-2 rounded"
                    >
                        <Text className="text-white font-semibold">⬅️ Retour</Text>
                    </TouchableOpacity>

                    {isAdmin && (
                        <TouchableOpacity onPress={() => setIsAdminModalVisible(true)}>
                            <AiFillTool className="text-2xl text-gray-700" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Contenu principal */}
                <View className="flex-col md:flex-row bg-white rounded-lg p-4 shadow-md">
                    {/* Partie gauche */}
                    <View className="w-full md:w-1/3 mb-6 md:mb-0 md:mr-8 relative">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-bold flex-1">{work?.title}</Text>
                            <TouchableOpacity onPress={() => handleFavorite(work.id)}>
                                <AiOutlineHeart className="text-3xl text-red-500" />
                            </TouchableOpacity>
                        </View>

                        <Image
                            source={{ uri: work?.coverUrl }}
                            className="w-40 h-60 rounded mb-4"
                            resizeMode="cover"
                        />

                        <Text className="text-base text-gray-700">{work?.description}</Text>
                    </View>

                    {/* Partie droite */}
                    <View className="w-full md:w-2/3">
                        <Text className="text-xl font-semibold mb-4 text-gray-800">
                            📚 Chapitres ({chapterCount})
                        </Text>

                        <View className="flex flex-wrap gap-y-2 gap-x-4">
                            {Array.from({ length: chapterCount }, (_, i) => chapterCount - i).map((chapterNum) => {
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
                                            className="mr-2"
                                        />
                                        <Text className="text-base text-gray-800">
                                            Chapitre {chapterNum}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* ✅ Modal Admin */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isAdminModalVisible}
                onRequestClose={() => setIsAdminModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80%]">
                        <Text className="text-lg font-bold mb-4 text-center">🛠️ Options administrateur</Text>

                        <Text className="text-sm text-gray-700 mb-2 text-center">
                            Sélectionne une couverture à appliquer ou modifie d'autres infos.
                        </Text>

                        {/* ✅ Images suggérées */}
                        {images.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row space-x-4 mb-4"
                            >
                                {images.map((url, index) => (
                                    <TouchableOpacity key={index} onPress={() => handleCoverUpdate(url)}>
                                        <Image
                                            source={{ uri: url }}
                                            className="w-24 h-36 rounded border border-gray-300"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            onPress={() => {
                                setIsAdminModalVisible(false)
                                router.push(`/admin/edit-cover/${work.id}`)
                            }}
                            className="bg-blue-600 py-2 px-4 rounded mb-2"
                        >
                            <Text className="text-white text-center">🖼️ Changer manuellement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsAdminModalVisible(false)}
                            className="mt-2"
                        >
                            <Text className="text-red-500 text-center">Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    )
}

export default WorkDetails
