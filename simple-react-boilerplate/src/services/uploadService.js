export const uploadToImgBB = async (file, apiKey) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', apiKey);
  const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
  const data = await response.json();
  if (data.success) return data.data.url;
  throw new Error('Upload failed');
};
