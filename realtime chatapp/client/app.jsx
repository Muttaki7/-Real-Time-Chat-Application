import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import API from './api'
import Login from './components/Login'
import ChatList from './components/ChatList'
import ChatWindow from './components/ChatWindow'


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'


export default function App() {
    const [user, setUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [conversations, setConv