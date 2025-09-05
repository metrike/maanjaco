import AsyncStorage from "@react-native-async-storage/async-storage";
import Return from "../type/return";
import axios from "axios";
import AXIOS_ERROR from "../type/axios_error";
import * as async_hooks from "node:async_hooks";
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


export const getSearchImages= async (id: number): Promise<string[]> => {
    const token = await AsyncStorage.getItem("token")

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }

    try {
        const response = await axios.get(`${API_URL}/works/searchImages/${id}`, config)
        return response.data
    } catch (err: unknown) {
        await AsyncStorage.removeItem('token')
        throw new Error("Error connecting to server")
    }
}

export const putFavoriteManga = async (id: number): Promise<Return> => {
    const token = await AsyncStorage.getItem("token")
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }

    try {
        const response = await axios.post<Return>(`${API_URL}/users/favoriteManga/${id}`, {}, config)
        return response.data
    } catch (err: unknown) {
        if ((err as AXIOS_ERROR).message) {
            await AsyncStorage.removeItem('token')
            throw new Error("Error connecting")
        } else {
            throw new Error("Error connecting to server")
        }
    }
}

export const ifMangaIsFavorite = async (workId: number): Promise<boolean> => {
    const token = await AsyncStorage.getItem("token")

    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }
    try {
        const response = await axios.get(`${API_URL}/users/ifMangaIsFavorite/${workId}`, config)
        return response.data.message
    } catch (err: unknown) {
        if ((err as AXIOS_ERROR).message) {
            await AsyncStorage.removeItem('token')
            throw new Error("Error connecting")
        } else {
            throw new Error("Error connecting to server")
        }
    }
}

export const getFavoriteMangas =async(): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
        const token = await AsyncStorage.getItem("token")

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        }

        try {
            const response = await axios.get(`${API_URL}/users/getFavoriteMangas`, config)
            resolve(response.data)
        } catch (err: unknown) {
            if ((err as AXIOS_ERROR).message) {
                await AsyncStorage.removeItem('token')
                reject(new Error("Error connecting"))
            } else {
                reject(new Error("Error connecting to server"))
            }
        }
    })
}