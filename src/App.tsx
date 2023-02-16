import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css'
import api from './services/api';
import Webcam from 'react-webcam'

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [products, setProducts] = useState([])
  const [cameraIsOpen, setCameraIsOpen] = useState(false)

  const webcamRef = useRef<any>(null)

  function dataURLtoFile(dataurl: any, filename: any) {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }

  const getSimilaryProducts = async (file: any) => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('productSet', 'geral')

    try {
      const { data: products } = await api.post('/getProducts', form)

      if (products?.length) {
        setProducts(products)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleTakePicture = useCallback(async () => {
    const picture = webcamRef?.current?.getScreenshot()
    const file = dataURLtoFile(picture, 'file.jpg')
    setCameraIsOpen(false)
    getSimilaryProducts(file)
  }, [webcamRef])

  useEffect(() => {
    getSimilaryProducts(selectedFile)
  }, [selectedFile])

  return (
    <div className="container">
      <div className="content-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {!cameraIsOpen ? (
          <>
            <input type="file" onChange={(e: any) => setSelectedFile(e?.target?.files[0])} />
            <button onClick={() => setCameraIsOpen(true)}>Foto</button>
            {products?.length ? 'Produtos relacionados:' : ''}
            {products?.length ? products?.map((product: any, index: any) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
              <span>
                Product name: {product?.product?.displayName}
              </span>
              <img src={product?.image} alt="Imagem"  width={200} />
              <span>
                Similarity: {Math.ceil(product?.score * 100)}%
              </span>
            </div>
          )) : null}
          </>
        ) : (
          <>
            <button onClick={() => setCameraIsOpen(false)}>Galeria</button>
            <Webcam
              audio={false}
              height={800}
              width={800}
              screenshotFormat="image/jpeg"
              ref={webcamRef}
            />
            <button onClick={() => handleTakePicture()}>Tirar foto</button>
          </>
        )}
      </div>
    </div>
  )
}

export default App;