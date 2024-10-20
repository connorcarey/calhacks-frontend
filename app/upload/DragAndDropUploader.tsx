"use client"; // Enables React Server Components in Next.js (client-side only rendering)

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
} from "@nextui-org/react"; // Import NextUI components
import { useState, useMemo } from "react"; // Import useState hook from React for managing state
import type { Selection } from "@nextui-org/react";

// Define the functional component using React.FC (React Function Component)
const DragAndDropUploader: React.FC = () => {
  // State for managing uploaded files with clothing type information
  const [files, setFiles] = useState<Array<{ file: File; type: string }>>([]);

  // State for managing the file that is temporarily stored until the form is submitted
  const [tempFile, setTempFile] = useState<File | null>(null);

  // State for managing modal visibility
  const [visible, setVisible] = useState(false);

  // State for the selected dropdown value
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["Select Clothing Type"]));

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  // Function to handle file drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent the default browser behavior for file drop
    const newFiles = Array.from(e.dataTransfer.files) as File[]; // Convert the dropped files to an array of File objects
    setTempFile(newFiles[0]); // Store the dropped file temporarily in tempFile
    setVisible(true); // Show the modal
  };

  // Function to handle click event for manually selecting files (opens a file picker)
  const handleClick = () => {
    const fileInput = document.createElement("input"); // Dynamically create an <input> element
    fileInput.type = "file"; // Set the input type to 'file' for file uploads
    fileInput.multiple = false; // Allow selecting multiple files
    fileInput.accept = "image/*"; // Restrict file selection to image types only

    // Event handler for when files are selected via the file picker
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement; // Type assertion to ensure TypeScript knows e.target is an HTML input
      const newFiles = target.files ? Array.from(target.files) as File[] : []; // Get selected files, if any, and convert to array
      setTempFile(newFiles[0]); // Store the selected file temporarily
      setVisible(true); // Show the modal
    };

    fileInput.click(); // Programmatically trigger the file input click, which opens the file picker
  };

  // Function to prevent default browser behavior when dragging files over the drop zone
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Function to handle the "Upload" button in the modal
  const handleUpload = () => {
    if (tempFile) {
      // Add the temporary file and selected clothing type to the main files state
      setFiles((prevFiles) => [...prevFiles, { file: tempFile, type: selectedValue }]);
      setTempFile(null); // Clear the temporary file
    }
    setVisible(false); // Close the modal
  };

  // Function to handle the "Cancel" button in the modal
  const handleCancel = () => {
    setTempFile(null); // Clear the temporary file
    setVisible(false); // Close the modal
  };

  // JSX structure for rendering the component
  return (
    <div className="p-10 min-h-screen min-w-max flex justify-center items-center">
      {/* Outer container for the drag-and-drop area */}
      <div className="p-5 bg-neutral-800 flex-auto h-[600px] min-w-[300px] w-full max-w-[1000px] rounded-xl flex flex-col space-y-5">

        {/* Title for the uploader */}
        <h1 className="text-large font-extrabold">Wardrobe</h1>

        {/* The drop zone where users can drop or click to upload files */}
        <div
          className="flex-grow outline-dashed outline-neutral-600 bg-neutral-900 rounded-lg p-5"
          onDrop={handleDrop} // When a file is dropped, this triggers the handleDrop function
          onDragOver={preventDefault} // Prevent default behavior on dragging files over the drop zone
          onClick={handleClick} // Trigger file picker on click
        >
          {/* Instructional text displayed in the drop zone */}
          <p className="text-center text-neutral-400">Click or drag to upload images</p>

          {/* Scrollable Grid for displaying uploaded images */}
          <ScrollShadow
            className="grid overflow-y-auto" // CSS classes for layout and scrollability
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', // Dynamic grid that adjusts the number of columns based on container width
              gap: '10px', // Space between grid items
              maxHeight: '400px', // Sets the height limit for the scrollable grid
              padding: '10px' // Padding around the grid content
            }}
          >
            {/* Map over the files array to generate a card for each uploaded image */}
            {files.map((fileObj, index) => (
              <Card
                key={index} // Unique key for each card (important for React rendering)
                isFooterBlurred // NextUI property to add a blurred footer effect (optional)
                radius="lg" // Sets the border-radius of the card
                className="border-none" // Removes the default border styling from the card
                style={{ width: '150px', height: '150px' }} // Force the card to be a fixed square size (150x150 pixels)
              >
                {/* Display the image inside the card */}
                <Image
                  src={URL.createObjectURL(fileObj.file)} // Create a URL for the uploaded image file
                  alt={fileObj.file.name} // Alt text for accessibility using the file's name
                  width="100%" // Ensure the image takes up the full width of the card
                  height="100%" // Ensure the image takes up the full height of the card
                />
                {/* Blurred footer to display the selected clothing type */}
                <CardFooter className="justify-center text-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                  <p>{fileObj.type}</p> {/* Centered text displaying the clothing type */}
                </CardFooter>
              </Card>
            ))}
          </ScrollShadow>
        </div>

        {/* Modal Component */}
        <Modal
          closeButton={false} // Disable the close button
          isOpen={visible} // Modal visibility controlled by visible state
          isDismissable={false} // Prevent closing by clicking outside or pressing escape
          hideCloseButton={true}
          aria-labelledby="modal-title" // Accessibility identifier
          size="xs" // Small size
        >
          <ModalContent>
            <ModalHeader>
              Clothing Type
            </ModalHeader>
            <ModalBody>
              <Dropdown>
                <DropdownTrigger>
                  <Button>
                    {selectedValue}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Multiple selection example"
                  variant="flat"
                  closeOnSelect={false}
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}>
                    <DropdownItem key="Shirt">Shirt</DropdownItem>
                    <DropdownItem key="Pants">Pants</DropdownItem>
                    <DropdownItem key="Accessory">Accessory</DropdownItem>
                    <DropdownItem key="Shoes">Shoes</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleCancel}>
                Cancel
              </Button>
              <Button color="success" onPress={handleUpload}>
                Upload
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default DragAndDropUploader; // Export the component for use in other parts of the app
