"use client";

import {
  Card,
  Image,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
  CardFooter,
} from "@nextui-org/react";
import { useState, useMemo, useEffect, DragEvent, ChangeEvent } from "react";
import type { Selection } from "@nextui-org/react";

// Define the type for the files array
interface UploadedFile {
  image_path: string;
  category_name: string;
}

// Utility function to add delay (sleep)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DragAndDropUploader: React.FC = () => {
  // State for managing uploaded files with clothing type information
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // State for managing the file that is temporarily stored until the form is submitted
  const [tempFile, setTempFile] = useState<File | null>(null);

  // State for managing modal visibility
  const [visible, setVisible] = useState(false);

  // State for tracking if an upload is in progress
  const [isUploading, setIsUploading] = useState(false);

  // State for the selected dropdown value
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["Select Clothing Type"]));

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  // Load saved data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/uploads/metadata.json");
        if (response.ok) {
          const metadata: UploadedFile[] = await response.json();
          setFiles(metadata);
        }
      } catch (error) {
        console.error("Failed to load metadata", error);
      }
    };
    loadData();
  }, []);

  // Handle file drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files); // Extract files from the drop event
    if (newFiles.length > 0) {
      setTempFile(newFiles[0]); // Set the first file as the temp file to be uploaded
      setVisible(true); // Open the modal to select the clothing type
    }
  };

  // Handle file selection from the file input
  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setTempFile(selectedFiles[0]); // Set the selected file as the temp file
      setVisible(true); // Show the modal
    }
  };

  // Prevent default behavior for drag over
  const preventDefault = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  // Handle click on the drop zone (to trigger file explorer)
  const handleClick = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Programmatically trigger the file input click
    }
  };

  // Handle file upload to the server
// Handle file upload to the server
const handleUpload = async () => {
  if (tempFile && !isUploading && selectedValue !== "Select Clothing Type") {
    setIsUploading(true); // Disable the button and prevent multiple clicks

    const formData = new FormData();
    formData.append("file", tempFile);
    formData.append("type", selectedValue); // Send selected type to the server

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const uploadedFileName = data.fileName; // Capture the uploaded file name returned by the server
        console.log(uploadedFileName)

        // Add the uploaded file and its associated type to the files state
        setFiles((prevFiles) => [...prevFiles, { image_path: uploadedFileName, category_name: selectedValue }]);

        // Now use the uploaded file name (instead of tempFile.name) in the next POST request
        try {
          const response = await fetch("http://0.0.0.0:8000/rest/post1", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              category_name: selectedValue,
              image_path: uploadedFileName, // Use the dynamically received file name
            }),
            mode: "no-cors",
          });
        
          if (response.ok) {
            const responseData = await response.json();
            console.log("Success:", responseData);
          } else {
            console.error("Failed to send data to the server", response.statusText);
          }
        } catch (error) {
          console.error("Error making the request:", error);
        }

      } else {
        console.error("Failed to upload file to the server", response.statusText);
      }
    } catch (error) {
      console.error("Failed to upload file", error);
    }

    setTempFile(null);
    setVisible(false);

    // Add a sleep function to avoid rapid submissions
    await sleep(500); // Sleep for 500ms before re-enabling the button
    setIsUploading(false);
  }
};


  return (
    <div className="p-10 min-h-screen min-w-max flex justify-center items-center">
      <div className="p-5 bg-neutral-800 flex-auto h-[600px] min-w-[300px] w-full max-w-[1000px] rounded-xl flex flex-col space-y-5">
        <h1 className="text-3xl font-extrabold">Wardrobe</h1>

        {/* Invisible file input for click-to-upload */}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileSelection} // Handle file selection
        />

        <div
          className="flex-grow outline-dashed outline-neutral-600 bg-neutral-900 rounded-lg p-5"
          onDrop={handleDrop} // Handle file drop
          onDragOver={preventDefault} // Prevent default drag-over behavior
          onClick={handleClick} // Trigger file explorer on click
        >
          <p className="text-center text-neutral-400">Click or drag to upload images</p>

          <ScrollShadow
            className="grid overflow-y-auto"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
              maxHeight: '400px',
              padding: '10px',
            }}
          >
            {/* Iterate over the files and render each one */}
            {files.map((fileObj, index) => (
              <Card
                key={index} // Unique key for each card
                isFooterBlurred // Add a blurred footer
                radius="lg"
                className="border-none relative overflow-hidden"
                style={{ width: '150px', height: '150px', position: 'relative' }} // Force the card to be a fixed square size (150x150 pixels)
              >
                <Image
                  src={`/uploads/${fileObj.image_path}`} // Load image from the uploaded files
                  alt={fileObj.category_name}
                  width="100%"
                  height="100%"
                />
                {/* Blurred footer with centered text */}
                <CardFooter
                  className="justify-center text-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10"
                >
                  <p className="font-semibold text-white text-sm">{fileObj.category_name}</p> {/* Display the clothing type */}
                </CardFooter>
              </Card>
            ))}
          </ScrollShadow>
        </div>

        <Modal
          closeButton={false}
          isOpen={visible}
          isDismissable={false}
          hideCloseButton={true}
          size="xs"
        >
          <ModalContent>
            <ModalHeader>Clothing Type</ModalHeader>
            <ModalBody>
              <Dropdown>
                <DropdownTrigger>
                  <Button>{selectedValue}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Multiple selection example"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}
                >
                  <DropdownItem key="Shirt">Shirt</DropdownItem>
                  <DropdownItem key="Pants">Pants</DropdownItem>
                  <DropdownItem key="Accessory">Accessory</DropdownItem>
                  <DropdownItem key="Shoes">Shoes</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onPress={() => setVisible(false)}>Cancel</Button>
              <Button 
                color="success" 
                onPress={handleUpload} 
                disabled={isUploading || selectedValue === "Select Clothing Type"} // Disable if uploading or no valid selection
              >
                {isUploading ? "Uploading..." : "Upload"} {/* Change text when uploading */}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default DragAndDropUploader;
