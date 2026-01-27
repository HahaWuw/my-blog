"use client"
import React, {useContext, useState, createContext} from 'react'

const UserContext = createContext()

export const UserProvider = ({children}) => {
    const [user, setUser] = useState({
        name: '', email: ''
    })

    const updateUser = (newUser) => {
        setUser(prev => ({ ...prev, ...newUser}))
    }

    const value = {
        user, updateUser,
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if(!context) {
        throw new Error('useUser 必须在 UserProvider 内部使用')
    }
    return context
}