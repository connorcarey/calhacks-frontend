// components/ChatInput.tsx
"use client";  // Ensures the component is client-side

import React, { useState } from 'react';
import {Textarea} from "@nextui-org/react";

const ChatInput: React.FC = () => {
  const [input, setInput] = useState<string>('');  // State to store user input

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // Handle form submission (optional, can modify this to actually process the input)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // You can handle what happens when the form is submitted here
    console.log("User input:", input);
  };

  return (
    <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <Textarea
        label="Description"
        placeholder="Enter your description (Default autosize)"
        />
  </div>
  );
};

export default ChatInput;
