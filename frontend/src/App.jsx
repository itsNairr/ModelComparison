import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [val, setVal] = useState("Upload image to predict");
  const [data, setData] = useState("");

  const handleImageUpload = (event) => {
    setDisplayImage(URL.createObjectURL(event.target.files[0]));
    setSelectedImage(event.target.files[0]);
  };

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.status);
        setData(data.status);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(selectedImage); // Log selectedImage
    const formData = new FormData();
    formData.append("file", selectedImage);
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const newData = await res.json();
      console.log(newData.message);
      setData(newData.message);
      setVal(newData.message);
      alert("File uploaded successfully.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mt-10">
        <div className="font-bold text-[25px] w-[40%] text-center">
          Comparative Analysis of Transformers and Convolutional Recurrent
          Neural Networks for Image-to-Text Caption Generation
        </div>
        <div className="w-[40%] h-[40%] mt-10">
          {displayImage && (
            <img className="rounded-xl" src={displayImage} alt="Selected" />
          )}
        </div>
      </div>
      <form
        className="flex flex-col items-center mt-10"
        onSubmit={handleSubmit}
      >
        <input
          id="image"
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleImageUpload}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold text-[50px] py-2 px-4 rounded mt-5"
        >
          Upload
        </button>
      </form>
    </>
  );
}

export default App;
