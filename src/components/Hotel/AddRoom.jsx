// ExampleComponent.js
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useAddRoomsMutation, useUpdateRoomsMutation } from "@/api/api";
import { handleImagePreviews } from "@/utils/ImageUtils";
import {
  uploadFileToFirebaseStorage,
  deleteFile,
} from "@/utils/firebaseStorage";

const AddRoom = ({ hotelId, roomId, image }) => {
  const [addRooms] = useAddRoomsMutation();
  const [updateRooms] = useUpdateRoomsMutation();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "facilities",
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const submitAlbum = async (data) => {
    try {
      const imagesArray = Array.isArray(data.roomImage)
        ? data.roomImage
        : Object.values(data.roomImage);

      const uploadPromises = imagesArray.map((image) => {
        const folder = "roomImages";
        return uploadFileToFirebaseStorage(image, folder);
      });

      const resolvedDownloadURLs = await Promise.all(uploadPromises);

      //Filter out null values (failed Uploads)
      const successulURLs = resolvedDownloadURLs.filter((url) => url !== null);
      const formData = new FormData();
      formData.append("roomNumber", data.roomNumber);
      formData.append("roomType", data.roomType);
      formData.append("pricePerNight", data.pricePerNight);
      formData.append("availability", data.availability);
      formData.append("hotelId", hotelId);

      data.facilities.forEach((facility, index) => {
        formData.append(`facilities[${index}]`, facility);
      });

      successulURLs.forEach((url, index) => {
        formData.append(`image[${index}]`, url);
      });

      if (roomId) {
        const deletePromises = image.map(async (x) => {
          return deleteFile(x);
        });
        await Promise.all(deletePromises);
        await updateRooms({ id: roomId, updateRoom: formData }).unwrap();
      } else {
        await addRooms(formData).unwrap();
      }
      reset();
      setImagePreviews([]);
    } catch (error) {
      console.error("Error adding/upating Rooms:", error);
    }
  };

  const handleImagePreview = (e) => {
    const files = e.target.files;

    handleImagePreviews(files, setImagePreviews);
  };

  return (
    <div>
      <h3>{roomId ? "Edit Room" : "Add new Room"}</h3>

      <form onSubmit={handleSubmit(submitAlbum)} encType="multipart/form-data">
        <input
          {...register("roomNumber", { required: true })}
          placeholder="RoomNumber"
          type="Number"
        />
        {errors.RoomNumber && <p>RoomNumber is required</p>}

        <div>
          <label>Room Type:</label>
          <div>
            <label>
              <input
                {...register("roomType", { required: true })}
                type="radio"
                value="Single"
              />
              Single
            </label>
            <label>
              <input
                {...register("roomType", { required: true })}
                type="radio"
                value="Double"
              />
              Double
            </label>
            <label>
              <input
                {...register("roomType", { required: true })}
                type="radio"
                value="Suite"
              />
              Suite
            </label>
          </div>
          {errors.roomType && <p>Room Type is required</p>}
        </div>

        <input
          {...register("pricePerNight", { required: true })}
          placeholder="PricePerNight"
          type="Number"
        />
        {errors.PricePerNight && <p>PricePerNight is required</p>}

        <label>
          Availability:
          <input
            {...register("availability", { required: true })}
            type="checkbox"
          />
        </label>
        {errors.availability && <p>Availability is required</p>}

        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              {...register(`facilities.${index}`, { required: true })}
              placeholder={`Facility ${index + 1}`}
              type="text"
            />
            {errors.facilities && errors.facilities[index] && (
              <p>{errors.facilities[index].message}</p>
            )}
            <button type="button" onClick={() => remove(index)}>
              Remove Facility
            </button>
          </div>
        ))}

        <button type="button" onClick={() => append("")}>
          Add Facility
        </button>

        <input
          {...register("roomImage", {
            required: true,
            validate: {
              fileFormat: (value) => {
                if (!value || !value.type || !value.type.startsWith("image/")) {
                  return {
                    type: "fileFormat",
                    message:
                      "Images are required and must be in the correct format.",
                  };
                }
                return true;
              },
            },
          })}
          type="file"
          accept="image/*"
          onChange={handleImagePreview}
          multiple
        />

        {errors.hotelImage && (
          <p>
            {errors.hotelImage.type === "fileFormat"
              ? "Images are required and must be in the correct format."
              : "Images are required."}
          </p>
        )}

        {imagePreviews.map((preview, index) => (
          <img
            key={index}
            src={preview}
            alt={`Preview ${index + 1}`}
            style={{ width: "100px", height: "100px", marginRight: "10px" }}
          />
        ))}
        <input type="submit" value={roomId ? "Update Room" : "Add Room"} />
      </form>
    </div>
  );
};

export default AddRoom;
