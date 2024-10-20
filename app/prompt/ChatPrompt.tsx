// components/ChatInput.tsx
"use client";  // Ensures the component is client-side

import React, { useState } from 'react';
import { Card, CardBody, Divider, CardHeader } from '@nextui-org/react';

export default function ChatInput() {
    const [value, setValue] = useState<string>('');  // State to store user input
    const [messages, setMessages] = useState<string[]>([]);  // State to store the messages

    const handleSubmit = () => {
        if (value.trim()) {
            setMessages((prevMessages) => [value, ...prevMessages]);
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Messages Section */}
            <div className="w-full max-w-3xl mb-4">

                {messages.map((message, index) => (
                    <Card key={index} className="mb-3" >
                        <CardHeader className="flex gap-3">
                           
                            <div className="flex flex-col">
                                <p className="text-md">User</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p>{message}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Input Section */}
            <div className="w-full max-w-3xl">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-md">
                    {/* Input Field */}
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message ChatGPT"
                        className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />

                    {/* Submit Button */}
                    <button className="ml-3 bg-black text-white p-2 rounded-full" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
