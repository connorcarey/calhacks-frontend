"use client"; // Ensures the component is client-side

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, ScrollShadow, Button, Spinner } from '@nextui-org/react';

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

export default function ChatInput() {
    const [value, setValue] = useState<string>(''); // State to store user input
    const [messages, setMessages] = useState<Message[]>([]); // State to store the messages
    const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading state
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

    // Scroll to the bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async () => {
        if (value.trim()) {
            // Add user message
            const userMessage: Message = { sender: 'user', text: value };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setValue('');

            // Set loading state
            setIsLoading(true);

            try {
                // Make POST request to the endpoint
                const response = await fetch('http://0.0.0.0:8000/rest/post4', { // Replace with your actual endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: value }),
                    mode: "no-cors",
                });

                console.log(response.json())

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();

                // Assuming the response contains a list of lists with ID and image description
                // For example: [["1234", "Image description 1"], ["5678", "Image description 2"]]
                data.forEach((item: [string, string]) => {
                    const [id, description] = item;
                    const botMessage: Message = { sender: 'bot', text: `ID: ${id} - Description: ${description}` };
                    setMessages((prevMessages) => [...prevMessages, botMessage]);
                });
            } catch (error) {
                console.error('Failed to fetch bot response:', error);
                const errorMessage: Message = { sender: 'bot', text: 'Sorry, something went wrong.' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4">
            {/* Messages Section */}
            <ScrollShadow className="w-full max-w-3xl mb-4 text-white p-4 rounded-lg shadow-lg h-[650px] overflow-y-auto flex flex-col" visibility="top">
                <div className="flex-grow"></div> {/* Pushes messages to the bottom */}
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500">No messages yet</p>
                    ) : (
                        messages.map((message, index) => (
                            <Card key={index} className={`text-white ${message.sender === 'user' ? 'bg-blue-600 self-end' : 'bg-neutral-700 self-start'}`}>
                                <CardHeader className="flex gap-3">
                                    <div className="flex flex-col">
                                        <p className="text-md">{message.sender === 'user' ? 'User' : 'Bot'}</p>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p>{message.text}</p>
                                </CardBody>
                            </Card>
                        ))
                    )}
                    {isLoading && (
                        <Card className="bg-neutral-700 text-white">
                            <CardHeader className="flex gap-3">
                                <div className="flex flex-col">
                                    <p className="text-md">Bot</p>
                                </div>
                            </CardHeader>
                            <CardBody className="flex items-center">
                                <Spinner size="sm" className="mr-2" />
                                <p>Typing...</p>
                            </CardBody>
                        </Card>
                    )}
                    <div ref={messagesEndRef} /> {/* Element to ensure auto-scrolling */}
                </div>
            </ScrollShadow>

            {/* Input Section */}
            <div className="w-full max-w-3xl">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-md">
                    {/* Input Field */}
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Input your message"
                        className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />

                    {/* Submit Button */}
                    <Button className='rounded-full' onClick={handleSubmit} disabled={isLoading}>
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
