import { useAuth } from "../../provider/AuthProvider"
import { useState } from "react"
import { searchManga } from "../../services/WorkService"
import { AiOutlineHeart } from "react-icons/ai"
import {useRouter} from "expo-router";

const Search = () => {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])

    const handleSearch = async () => {
        if (!query.trim()) return

        try {
            const response = await searchManga(query.trim())
            setResults(response)
        } catch (error) {
            console.error("Erreur de recherche :", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch()
    }

    const handleFavorite = async (workId: string) => {
        // try {
        //     await addToFavorites(workId)
        //     alert("Ajouté aux favoris !")
        // } catch (err) {
        //     console.error("Erreur lors de l'ajout en favoris :", err)
        // }
    }

    return (
        <div className="flex flex-col items-center h-screen p-6 overflow-hidden">
            <h1 className="text-3xl font-bold mb-4">🔍 Rechercher un manga</h1>

            <div className="flex w-full max-w-md mb-6">
                <input
                    type="text"
                    placeholder="Titre du manga..."
                    className="flex-1 p-2 border border-gray-300 rounded-l"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSearch}
                    className="px-4 bg-blue-600 text-white rounded-r"
                >
                    Rechercher
                </button>
            </div>

            {/* Scrollable result area */}
            <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 pr-2">
                {results.map((work: any) => (
                    <div
                        key={work.id}
                        className="flex gap-4 border rounded p-4 shadow bg-white hover:shadow-md transition"
                    >
                        {/* Bloc cliquable */}
                        <div
                            className="flex gap-4 flex-1 cursor-pointer"
                            onClick={() => router.push(`/work-details/${work.id}`)}
                        >
                            <img
                                src={work.coverUrl}
                                alt={work.title}
                                className="w-24 h-36 object-cover rounded"
                            />

                            <div className="flex flex-col justify-between flex-1">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-semibold">{work.title}</h2>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    {work.description?.slice(0, 100)}...
                                </p>
                                <p className="text-sm text-gray-500">
                                    Chapitres : {work.totalChapters}
                                </p>
                            </div>
                        </div>

                        {/* Coeur à droite */}
                        <button onClick={() => handleFavorite(work.id)}>
                            <AiOutlineHeart className="text-2xl text-red-500 hover:text-red-700" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Search
