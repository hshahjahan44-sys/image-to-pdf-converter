// Variable declarations (HTML elements ko select karna)
const imageUploader = document.getElementById('imageUploader');
const previewArea = document.getElementById('previewArea');
const convertBtn = document.getElementById('convertBtn');
const message = document.getElementById('message');

// Global array to store all uploaded image files
let imageFiles = [];

// 1. Image Upload hone par (Jab user files select karta hai)
imageUploader.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    message.textContent = ''; // Purana message hatana

    files.forEach(file => {
        // Sirf images ko accept karna
        if (file.type.startsWith('image/')) {
            imageFiles.push(file);
            displayImagePreview(file);
        } else {
            message.textContent = '❌ Invalid file type ignored.';
        }
    });

    // Agar koi file upload hui hai, toh Convert button dikhana
    if (imageFiles.length > 0) {
        convertBtn.style.display = 'block';
    }
    
    // File input ko reset karna taaki same file dobara select ki ja sake
    e.target.value = null; 
});

// 2. Image Preview dikhana aur Delete button banana
function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview';
        
        const img = document.createElement('img');
        img.src = event.target.result;
        img.alt = file.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        
        // Delete button ka logic
        deleteBtn.addEventListener('click', function() {
            // Array se file hatana
            const index = imageFiles.indexOf(file);
            if (index > -1) {
                imageFiles.splice(index, 1);
            }
            // Preview se element hatana
            previewArea.removeChild(previewItem);
            
            // Agar koi file nahi bachi, toh Convert button chupana
            if (imageFiles.length === 0) {
                convertBtn.style.display = 'none';
            }
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(deleteBtn);
        previewArea.appendChild(previewItem);
    }
    
    reader.readAsDataURL(file);
}

// 3. PDF Conversion ka main logic
convertBtn.addEventListener('click', function() {
    if (imageFiles.length === 0) {
        message.textContent = '❌ Please upload at least one image.';
        return;
    }
    
    message.textContent = '⏳ Converting images to PDF...';
    convertBtn.disabled = true; // Button ko disable karna

    // jsPDF Object create karna
    // window.jsPDF is available because humne isko HTML file mein link kiya hai
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for Portrait, 'mm' for unit, 'a4' size
    
    let imagesProcessed = 0;
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const imgData = event.target.result;
            const img = new Image();
            
            img.onload = function() {
                const imgWidth = img.width;
                const imgHeight = img.height;
                
                // A4 size ke dimensions (mm mein)
                const a4Width = 210;
                const a4Height = 297;
                
                // Image ko A4 size par fit karne ke liye calculations
                let ratio = a4Width / imgWidth;
                let finalWidth = a4Width;
                let finalHeight = imgHeight * ratio;
                let x = 0;
                let y = 0;

                // Agar height zyada ho, toh height ke hisaab se fit karna (optional)
                if (finalHeight > a4Height) {
                    ratio = a4Height / imgHeight;
                    finalHeight = a4Height;
                    finalWidth = imgWidth * ratio;
                    x = (a4Width - finalWidth) / 2; // Center alignment
                } else {
                    y = (a4Height - finalHeight) / 2; // Center alignment
                }

                // Agar yeh pehla image nahi hai, toh naya page add karna
                if (index > 0) {
                    pdf.addPage();
                }

                // PDF mein image add karna
                pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
                
                imagesProcessed++;
                
                // Jab saare images process ho jaayen
                if (imagesProcessed === imageFiles.length) {
                    // PDF file ko download karwana
                    pdf.save('images-converted.pdf');
                    
                    message.textContent = '✅ Conversion successful! PDF file downloaded.';
                    convertBtn.disabled = false; // Button ko wapas enable karna
                }
            };
            img.src = imgData;
        };
        reader.readAsDataURL(file);
    });
});
