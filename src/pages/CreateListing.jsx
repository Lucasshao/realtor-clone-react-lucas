import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
  } = formData;
  function onChange(e) {
    let boolean = null; //base on the input, change the boolean, to change the state in the form data
    if (e.target.value === "true") {
      boolean = true;
    }

    if (e.target.value === "false") {
      boolean = false;
    }
    //Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    //Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("maximum 6 images are allowed");
      return;
    }
    let geolocation = {};
    let location;
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );
      const data = await response.json();
      console.log(data);
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location = data.status === "ZERO_RESULTS" && undefined;

      if (location === undefined) {
        setLoading(false);
        toast.error("please enter a correct address");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
        /**
         * uploadTask.on() 方法包含三个参数，每个参数都是一个回调函数，分别对应不同的状态或事件。在你的代码示例中，uploadTask.on() 包含了三个回调函数，分别用于处理不同的情况：

        状态改变回调函数 (State change callback)：这个回调函数在上传任务的状态发生变化时被调用，它接收一个参数 snapshot，用于描述当前上传任务的状态。在你的代码中，第一个参数 (snapshot) => { ... } 就是用来处理状态变化的回调函数。

        错误回调函数 (Error callback)：这个回调函数在上传过程中出现错误时被调用，它接收一个参数 error，用于描述出现的错误。在你的代码中，第二个参数 (error) => { ... } 就是用来处理错误的回调函数。

        完成回调函数 (Completion callback)：这个回调函数在上传任务成功完成时被调用，它不接收任何参数。在你的代码中，第三个参数 () => { ... } 就是用来处理上传成功完成的回调函数。

        所以，uploadTask.on() 方法中包含的是三个回调函数，分别用于处理状态变化、错误和上传成功完成这三种情况。 */
      });
    }

    /**
     * async function storeImage(image) { ... }: 这是一个异步函数的声明，意味着函数体内可以包含异步操作，函数执行会返回一个 Promise 对象。

    return new Promise((resolve, reject) => { ... }): 在函数体内部，它创建了一个新的 Promise 对象，用于处理图片上传过程中的异步操作。resolve 和 reject 是 Promise 的两个回调函数，用于在异步操作成功或失败时解决或拒绝 Promise。

    const storage = getStorage();: 这一行获取了 Firebase Storage 的引用。

    const filename = ${auth.currentUser.uid}-${image.name}-${uuidv4()};: 这里生成了一个唯一的文件名，结合了用户的UID、图片的原始名称和一个随机生成的UUID。

    const storageRef = ref(storage, filename);: 这行创建了一个指向指定路径的存储引用，即创建了一个指向图片存储位置的引用。

    const uploadTask = uploadBytesResumable(storageRef, image);: 这行创建了一个可暂停和恢复的字节上传任务，该任务用于将图片以字节的形式上传到指定的存储引用。

    uploadTask.on(...)：这里使用了 uploadTask.on() 方法来监听上传任务的不同状态，如进度、暂停、继续等。在其中包含了对上传过程中的状态的处理。

    (error) => { reject(error); }: 如果上传过程中出现错误，就会调用 reject 函数并传递错误对象。

    () => { ... }: 当图片成功上传后，会执行这个回调函数，在其中获取了上传图片的下载URL，并通过 resolve 函数将下载URL解决为 Promise 的结果。

    总之，这段代码是一个用于上传图片到 Firebase Storage 的异步函数，它通过 Promise 对象管理了上传过程中的异步操作，并在上传成功或失败时返回相应的结果。
     */

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });
    /**
     * 并行执行： map方法允许你对数组中的每个元素执行相同的操作，Promise.all()允许多个异步操作同时进行，提高了效率。 等待所有操作完成：它等待所有的Promise都解决后再返回结果，这在某些情况下是必要的，比如需要所有图片都上传完毕后再进行下一步操作。 简洁性：使用Promise.all()可以使代码更加简洁和易于理解。
      Promise.all()方法接受一个Promise数组作为参数，它会等待所有的Promise都被解决（resolved）后返回一个包含所有Promise解决值的数组。在这里，Promise.all()会等待所有图片上传的Promise都解决后返回。 [...images].map((image) => storeImage(image)): 这一行代码是一个数组的映射操作。假设images是一个类数组对象（比如一个DOM节点列表），[...images]将其转换为真正的数组，然后调用map()方法。map()方法对数组中的每个元素执行给定的函数，这里是storeImage(image)，它返回一个Promise，表示图片上传的过程。*/
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    /**const formDataCopy = { ...formData, imgUrls, geolocation, timestamp: serverTimestamp(), userRef: auth.currentUser.uid };: 这行代码创建了一个新对象 formDataCopy，它是表单数据 formData 的一个副本，但加入了额外的属性 imgUrls、geolocation、timestamp、userRef。其中 imgUrls 存储图片的URL数组，geolocation 存储地理位置信息，timestamp 存储服务器的时间戳，userRef 存储当前用户的UID。

delete formDataCopy.images;: 这行代码从 formDataCopy 对象中删除了 images 属性。

!formDataCopy.offer && delete formDataCopy.discountedPrice;: 如果 formDataCopy.offer 为假值（即假值包括 false、null、undefined、''、0、NaN），则删除 formDataCopy 中的 discountedPrice 属性。

delete formDataCopy.latitude; 和 delete formDataCopy.longitude;: 分别从 formDataCopy 对象中删除 latitude 和 longitude 属性。

const docRef = await addDoc(collection(db, "listings"), formDataCopy);: 这行代码使用 addDoc() 方法向指定集合（listings）添加一个新文档，文档的内容是 formDataCopy 对象。它返回一个表示添加的文档的引用。

setLoading(false);: 这行代码取消加载状态。

toast.success("Listing created");: 这行代码显示一个成功提示，表示列表项已成功创建。

navigate(/category/${formDataCopy.type}/${docRef.id});: 这行代码使用导航工具（比如 React Router 的 navigate 函数）导航到新创建的列表项所属的类别页面，并将新创建的列表项的类型和ID作为路径的一部分。

总之，这段代码是一个完整的数据处理流程，它处理了表单数据，执行了添加文档到数据库的操作，并显示了相应的提示信息。 */
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="max-w-md px-2 mx-auto ">
      <h1 className="mt-6 text-3xl font-bold text-center">Create a Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="mt-6 text-lg font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            Rent
          </button>
        </div>
        <p className="mt-6 text-lg font-semibold">Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Property Name"
          maxLength="32"
          minLength="10"
          required
          className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />
        <div>
          <div className="flex mb-6 space-x-6">
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-center text-gray-300 transition duration-150 ease-in-out bg-white border-gray-700 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />

            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-center text-gray-300 transition duration-150 ease-in-out bg-white border-gray-700 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold">Parking spot</p>
        <div className="flex">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            No
          </button>
        </div>
        <p className="mt-6 text-lg font-semibold">Furnished</p>
        <div className="flex">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            No
          </button>
        </div>
        <p className="mt-6 text-lg font-semibold">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />
        {!geolocationEnabled && (
          <div className="flex justify-start mb-6 space-x-6">
            <div className="">
              <p className="text-lg font-semibold">Latitude</p>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={onChange}
                required
                min="-90"
                max="90"
                className="w-full px-4 py-2 text-xl text-center text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:bg-white focus:text-gray-700 focus:border-slate-600"
              />
            </div>
            <div className="">
              <p className="text-lg font-semibold">Longitude</p>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={onChange}
                required
                min="-180"
                max="180"
                className="w-full px-4 py-2 text-xl text-center text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:bg-white focus:text-gray-700 focus:border-slate-600"
              />
            </div>
          </div>
        )}
        <p className="text-lg font-semibold">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`} //`` backtick 反引号
          >
            No
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div>
            <p className="text-lg font-semibold ">Regular Price</p>
            <div className="flex items-center justify-center w-full space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="50"
                max="400000000"
                required
                className="w-full px-4 py-2 text-xl text-center text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
              />
              {type === "rent" && (
                <div>
                  <p className="w-full text-md whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {offer && (
          <div className="flex items-center mb-6">
            <div>
              <p className="text-lg font-semibold ">Discounted Price</p>
              <div className="flex items-center justify-center w-full space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-center text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-slate-600"
                />
                {type === "rent" && (
                  <div>
                    <p className="w-full text-md whitespace-nowrap">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mb-6 ">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600 ">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600 "
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 mb-6 text-sm font-medium text-white uppercase transition duration-150 ease-in-out bg-blue-600 rounded shadow-md px-7 hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg"
        >
          Create Listing
        </button>
      </form>
    </main>
  );
}
