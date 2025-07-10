import { useAuth } from "../../provider/AuthProvider"
import { useEffect } from "react"
import { getChapterCount } from "../../services/scraper"
import { FiSearch } from "react-icons/fi"
import {useRouter} from "expo-router"; // Icône loupe

const Home = () => {
    const { isAuthenticated } = useAuth()
    const router = useRouter();

    useEffect(() => {
        // ...
    }, [])

    return (
        <div className="flex flex-col items-center justify-start h-full p-6">
                <button onClick={() => router.push("/search")} className="text-2xl text-gray-700 hover:text-black">
                    <FiSearch />
                </button>

            <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
            <p className="text-lg">This is the main content area.</p>
        </div>
    )
}

export default Home
