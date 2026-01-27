"use client"
import React, {useContext, useState, createContext} from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light')

    const toggleTheme = () => {}

    const value = {
        theme, toggleTheme,
        colors: theme === 'light' ? { bg: '#fff', text: '#333', border: '#e0e0e0'} : { bg: '#1a1a1a', text: '#fff', border: '#444'} 
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if(!context) {
        throw new Error('useTheme 必须在 ThemeProvider 内部使用')
    }
    return context
}