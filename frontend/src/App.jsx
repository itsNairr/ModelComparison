import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [numModels, setNumModels] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ltext, setLtext] = useState("Choose an image");
  const [displayImage, setDisplayImage] = useState(null);
  const [displayCheck, setDisplayCheck] = useState(null);
  const [models, setModel] = useState([]);
  const [modelCheck, setModelCheck] = useState(null);
  const [LSTMCheck, setLSTMCheck] = useState(null);
  const [GRUCheck, setGRUCheck] = useState(null);
  const [RNNCheck, setRNNCheck] = useState(null);
  const [BiLSTMCheck, setBiLSTMCheck] = useState(null);
  const [BiGRUCheck, setBiGRUCheck] = useState(null);
  const [BiRNNCheck, setBiRNNCheck] = useState(null);
  const [epochCheck, setEpochCheck] = useState(null);
  const [epochs, setEpochs] = useState(["", "", "", "", "", ""]);
  const [val, setVal] = useState("Upload an image to get started.");
  const [data, setData] = useState({});
  const [status, setStatus] = useState("Disconnected");

  const handleImageUpload = (event) => {
    setDisplayImage(URL.createObjectURL(event.target.files[0]));
    setSelectedImage(event.target.files[0]);
    setDisplayCheck(true);
  };

  useEffect(() => {
    console.log(numModels);
    if (numModels > 0) {
      setModelCheck(true);
    } else if (numModels === 0) {
      setModelCheck(null);
    }
    console.log(models);
  }, [numModels]);

  useEffect(() => {
    console.log(epochs);
    const epochChecker = epochs.filter((epoch) => epoch != "").length;
    if (epochChecker === numModels && numModels !== 0) setEpochCheck(true);
    else setEpochCheck(null);
    console.log(epochChecker);
  }, [epochs, numModels]);

  const handleEpochChange = (event) => {
    if (event.target.id === "LSTMepochs") {
      setEpochs((prevEpoches) => [
        event.target.value,
        prevEpoches[1],
        prevEpoches[2],
        ...prevEpoches.slice(3, 6),
      ]);
    }
    if (event.target.id === "GRUepochs") {
      setEpochs((prevEpoches) => [
        prevEpoches[0],
        event.target.value,
        prevEpoches[2],
        ...prevEpoches.slice(3, 6),
      ]);
    }
    if (event.target.id === "RNNepochs") {
      setEpochs((prevEpoches) => [
        prevEpoches[0],
        prevEpoches[1],
        event.target.value,
        ...prevEpoches.slice(3, 6),
      ]);
    }
    if (event.target.id === "BiLSTMepochs") {
      setEpochs((prevEpoches) => [
        
          ...prevEpoches.slice(0, 3),
          event.target.value,
          ...prevEpoches.slice(4, 6),
        ,
      ]);
    }
    if (event.target.id === "BiGRUepochs") {
      setEpochs((prevEpoches) => [
        
          ...prevEpoches.slice(0, 4),
          event.target.value,
          ...prevEpoches.slice(5, 6),
        ,
      ]);
    }
    if (event.target.id === "BiRNNepochs") {
      setEpochs((prevEpoches) => [
        ...prevEpoches.slice(0, 5), event.target.value,
      ]);
    }
  };

  const handleModel = (event) => {
    if (event.target.checked) {
      if (event.target.value === "LSTM") setLSTMCheck(true);
      else if (event.target.value === "GRU") setGRUCheck(true);
      else if (event.target.value === "RNN") setRNNCheck(true);
      else if (event.target.value === "BiLSTM") setBiLSTMCheck(true);
      else if (event.target.value === "BiGRU") setBiGRUCheck(true);
      else if (event.target.value === "BiRNN") setBiRNNCheck(true);
      setNumModels((prevNumModels) => prevNumModels + 1);
      setModel((prevModel) => [...prevModel, event.target.value]);
    } else {
      if (event.target.value === "LSTM") setLSTMCheck(null);
      else if (event.target.value === "GRU") setGRUCheck(null);
      else if (event.target.value === "RNN") setRNNCheck(null);
      else if (event.target.value === "BiLSTM") setBiLSTMCheck(null);
      else if (event.target.value === "BiGRU") setBiGRUCheck(null);
      else if (event.target.value === "BiRNN") setBiRNNCheck(null);
      setNumModels((prevNumModels) => prevNumModels - 1);
      setModel((prevModel) =>
        prevModel.filter((model) => model !== event.target.value)
      );
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.status);
        setStatus(data.status);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    if (status === "Connected") {
      document.getElementById("pulse").classList.add("green-pulse");
      document.getElementById("pulse").classList.remove("red-pulse");
    }
  }, [status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    document.getElementById("submit").style.display = "none";
    setVal("Processing...");
    const formData = new FormData();
    formData.append("file", selectedImage);
    console.log(JSON.stringify(models));
    try {
      const res = await fetch("http://localhost:5000/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ models, epochs }),
      });
      const data = await res.json();
      console.log(data.message);
    } catch (error) {
      console.log(error);
    }
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const newData = await res.json();
      console.log(newData);
      setData(newData);
      setTimeout(() => {
        setLtext("Choose another image");
        setDisplayCheck(null);
        setEpochCheck(null);
        setModelCheck(null);
        setLSTMCheck(null);
        setGRUCheck(null);
        setRNNCheck(null);
        setBiLSTMCheck(null);
        setBiGRUCheck(null);
        setBiRNNCheck(null);
        setEpochs(["", "", "", "", "", ""]);
        setNumModels(0);
      }, 5000);
    } catch (error) {
      console.log(error);
    }
    setVal("Done.");
  };

  return (
    <>
      <div className="w-[100%] h-[10px] bg-[#F0B542]"></div>
      <div className="w-[100%] text-center mt-3 text-[25px] font-sofia font-bold flex flex-row justify-center items-center gap-5">
        {status}
        <span id="pulse" className="text-[40px] red-pulse">
          •
        </span>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen max-h-full font-sofia text-white font-bold text-[25px]">
        <div className="text-[35px]">Division of AI Research Presents:</div>
        <div className="font-bold text-[35px] w-[40%] text-center mb-5">
          Comparative Analysis of{" "}
          <span className="text-[#F0B542]">Transformers</span> and{" "}
          <span className="text-[#F0B542]">
            Convolutional Recurrent Neural Networks
          </span>{" "}
          for Image-to-Text Caption Generation
        </div>

        {displayImage && (
          <div className="w-[40%] my-10">
            <img className="rounded-xl" src={displayImage} alt="Selected" />
          </div>
        )}

        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          {!displayCheck && (
            <>
              <label
                htmlFor="image"
                className="font-bold text-[30px] p-7 rounded-xl inpt"
              >
                <input
                  required
                  id="image"
                  type="file"
                  accept="image/jpeg, image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div>{ltext}</div>
              </label>
            </>
          )}
          {displayCheck && (
            <>
              <div className="text-[25px] mb-5">
                Choose the model(s) to generate the caption:
              </div>
              <div className="flex flex-row gap-20 mb-5">
                <div>
                  <input
                    type="checkbox"
                    id="model1"
                    name="model1"
                    value="LSTM"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">LSTM</label>
                  <br />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="model2"
                    name="model2"
                    value="GRU"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">GRU</label>
                  <br />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="model3"
                    name="model3"
                    value="RNN"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">RNN</label>
                  <br />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="model5"
                    name="model5"
                    value="BiLSTM"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">BiLSTM</label>
                  <br />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="model4"
                    name="model4"
                    value="BiGRU"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">BiGRU</label>
                  <br />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="model6"
                    name="model6"
                    value="BiRNN"
                    onChange={handleModel}
                  />
                  <label htmlFor="model1">BiRNN</label>
                  <br />
                </div>
              </div>
            </>
          )}
          {modelCheck && LSTMCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for LSTM: &nbsp;
              <select
                id="LSTMepochs"
                name="LSTMepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && GRUCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for GRU: &nbsp;
              <select
                id="GRUepochs"
                name="GRUepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && RNNCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for RNN: &nbsp;
              <select
                id="RNNepochs"
                name="RNNepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && BiLSTMCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for BiLSTM: &nbsp;
              <select
                id="BiLSTMepochs"
                name="BiLSTMepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && BiGRUCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for BiGRU: &nbsp;
              <select
                id="BiGRUepochs"
                name="BiGRUepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && BiRNNCheck && (
            <div className="text-[25px] mb-5">
              Choose the number of epochs for BiRNN: &nbsp;
              <select
                id="BiRNNepochs"
                name="BiRNNepochs"
                onChange={(e) => handleEpochChange(e)}
              >
                <option value="">...</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
                <option value="18">18</option>
                <option value="21">21</option>
              </select>
            </div>
          )}
          {modelCheck && epochCheck && (
            <button
              type="submit"
              id="submit"
              className=" text-white font-bold text-[30px] px-7 py-4 rounded-xl upld"
            >
              Upload
            </button>
          )}
        </form>
        <div className="mt-5 mb-10 text-[25px]">{val}</div>
        {data.LSTMcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">LSTM</div>
            <div className="text-[20px] mb-5">{data.LSTMcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.LSTMet}s
            </div>
          </div>
        )}
        {data.GRUcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">GRU</div>
            <div className="text-[20px] mb-5">{data.GRUcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.GRUet}s
            </div>
          </div>
        )}
        {data.RNNcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">RNN</div>
            <div className="text-[20px] mb-5">{data.RNNcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.RNNet}s
            </div>
          </div>
        )}
        {data.BiLSTMcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">BiLSTM</div>
            <div className="text-[20px] mb-5">{data.BiLSTMcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.BiLSTMet}s
            </div>
          </div>
        )}
        {data.BiGRUcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">BiGRU</div>
            <div className="text-[20px] mb-5">{data.BiGRUcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.BiGRUet}s
            </div>
          </div>
        )}
        {data.BiRNNcaption && (
          <div className="flex flex-col items-center">
            <div className="text-[25px] mb-5 text-[#F0B542]">BiRNN</div>
            <div className="text-[20px] mb-5">{data.BiRNNcaption}</div>
            <div className="text-[20px] mb-5">
              Execution Time: {data.BiRNNet}s
            </div>
          </div>
        )}
      </div>
      <div className="w-[100%] h-[10px] bg-[#F0B542]"></div>
    </>
  );
}

export default App;
