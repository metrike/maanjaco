import AsyncStorage from "@react-native-async-storage/async-storage";
import Return from "../type/return";
import axios from "axios";
import AXIOS_ERROR from "../type/axios_error";
const API_URL=process.env.EXPO_PUBLIC_API_URL as string


export const searchManga = async (search: string): Promise<any> => {
    const token = await AsyncStorage.getItem("token")

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: {
            query: search, // 🔥 ici on passe bien la variable
        },
    }

    try {
        const response = await axios.get(`${API_URL}/works/search`, config)
        return response.data
    } catch (err: unknown) {
        await AsyncStorage.removeItem('token')
        throw new Error("Error connecting to server")
    }
}

export const getMangaDetails = async (id: number): Promise<any> => {
    const token = await AsyncStorage.getItem("token")

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }

    try {
        const response = await axios.get(`${API_URL}/getWorkById/${id}`, config)
        return response.data
    } catch (err: unknown) {
        await AsyncStorage.removeItem('token')
        throw new Error("Error connecting to server")
    }
}
