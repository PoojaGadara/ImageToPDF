import React, { ChangeEventHandler ,useEffect,useState } from "react";
import jsPDF from "jspdf";


//Custom Images Class
class CustomImage extends Image {
    constructor(public mimeType: string) {
      super();
    }
  
    get imageType(): string {
      return this.mimeType.split("/")[1];
    }
  }

  // Dimentions
  const A4_PAPER_DIMENSIONS = {
    width: 210,
    height: 297,
  };
  
  const A4_PAPER_RATIO = A4_PAPER_DIMENSIONS.width / A4_PAPER_DIMENSIONS.height;
  
  interface ImageDimension {
    width: number;
    height: number;
  }
  
  const imageDimensionsOnA4 = (dimensions: ImageDimension) => {
    const isLandscapeImage = dimensions.width >= dimensions.height;
  
    if (isLandscapeImage) {
      return {
        width: A4_PAPER_DIMENSIONS.width,
        height:
          A4_PAPER_DIMENSIONS.width / (dimensions.width / dimensions.height),
      };
    }

    const imageRatio = dimensions.width / dimensions.height;
    if (imageRatio > A4_PAPER_RATIO) {
      const imageScaleFactor =
        (A4_PAPER_RATIO * dimensions.height) / dimensions.width;
  
      const scaledImageHeight = A4_PAPER_DIMENSIONS.height * imageScaleFactor;
  
      return {
        height: scaledImageHeight,
        width: scaledImageHeight * imageRatio,
      };
    }
  
    return {
      width: A4_PAPER_DIMENSIONS.height / (dimensions.height / dimensions.width),
      height: A4_PAPER_DIMENSIONS.height,
    };
  };
  
  // Creates PDF 
  const generatePdfFromImages = (images: CustomImage[]) => {

    const doc = new jsPDF();
    doc.deletePage(1);
  
    images.forEach((image) => {
      const imageDimensions = imageDimensionsOnA4({
        width: image.width,
        height: image.height,
      });
  
      doc.addPage();
      doc.addImage(
        image.src,
        image.imageType,
        (A4_PAPER_DIMENSIONS.width - imageDimensions.width) / 2,
        (A4_PAPER_DIMENSIONS.height - imageDimensions.height) / 2,
        imageDimensions.width,
        imageDimensions.height
      );
    });
  
    // Creates a PDF and opens it in a new browser tab.
    const pdfURL = doc.output("bloburl");
    window.open(pdfURL as any, "_blank");
  };
  

export default function Form() {


    const [uploadedImages, setUploadedImages] = React.useState<CustomImage[]>([]);
    console.log(uploadedImages);

    const handleImageUpload = React.useCallback(
      (event:any) => {
    
        const fileList = event;
        const fileArray = fileList ? Array.from(fileList) : [];
        const fileToImagePromises = fileArray.map(fileToImageURL);
        Promise.all(fileToImagePromises).then(setUploadedImages);
      },
      [setUploadedImages]
    );
  
    const fileToImageURL = (file: any): Promise<CustomImage> => {
        return new Promise((resolve, reject) => {
          const image = new CustomImage(file.type);
      
          image.onload = () => {
            resolve(image);
          };
      
          image.onerror = () => {
            reject(new Error("Failed to convert File to Image"));
          };
      
          image.src = URL.createObjectURL(file);
        });
      };

    const [data ,setData] = useState({
        poNumber:'',
        imageFile:[]
    })

    const Eventchange = (event) =>{
        const {name,value} = event.target;

        setData((preval) => {
            return {
                ...preval,
                [name]:value,
            }
        });
    }

    const handleImages = (e)=>{
        setData({...data,imageFile:e.target.files});
    }

    const cleanUpUploadedImages = React.useCallback(() => {
        setUploadedImages([]);
        uploadedImages.forEach((image) => {
          URL.revokeObjectURL(image.src);
        });
      }, [setUploadedImages, uploadedImages]);
    
      const handleGeneratePdfFromImages = React.useCallback(() => {
        generatePdfFromImages(uploadedImages);
        cleanUpUploadedImages();
      }, [uploadedImages, cleanUpUploadedImages]);
    

      useEffect(()=>{
        if(uploadedImages.length>0){
            handleGeneratePdfFromImages();
        }
      },[uploadedImages])

    const formSubmit= async (e)=>{
        e.preventDefault();
        handleImageUpload(data.imageFile);
        alert(`PO Number is ${data.poNumber} selected image is ${data.imageFile}`);
        
    }
  return (
    <div>
    <div className="my-5">
        <h1 className='text-center'>PO Attechments</h1>
    </div>
   

    <div className='container contact_div'>
        <div className='row'>
            <div className='col-md-6 col-10 mx-auto'>
                <form  onSubmit={formSubmit} >
                        <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">PO Number</label>
                        <input type="text" 
                         className="form-control" 
                         id="exampleFormControlInput1"
                         name="poNumber"
                         value={data.poNumber}
                         onChange={Eventchange}
                         placeholder="Enter PO Number"
                         pattern='[PO]\w[-][0-9]*'
                         required 
                         />
                        </div>
                       
                        <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1"   className="form-label">Select Images</label>
                        <input type="file"  multiple
                         accept="image/*"
                         className="form-control" 
                         id="exampleFormControlInput1"
                         name="imageFile"
                        onChange={handleImages}
                         placeholder="Select Image"
                         required  pattern="[7-9]{1}[0-9]{9}" />
                        </div>

                        <div className="col-12">
                            <button className="btn btn-outline-primary" type="submit">
                                Submit form
                            </button>
                        </div>
                    
                        <div className="col-12">
                            <button className="btn btn-outline-primary" >
                                Generate PDF
                            </button>
                        </div>
                </form>
            </div>
        </div>
    </div>
</div>
  )
}
