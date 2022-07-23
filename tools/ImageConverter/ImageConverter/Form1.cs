using System;
using System.Drawing;
using System.Windows.Forms;

namespace ImageConverter
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {          
        }

        public string LoadBitmap(string file)
        {
            string pixels = "";
            try
            {
                var bmp = new Bitmap(Image.FromFile(file));
                if (bmp.Width == 64 && bmp.Height == 32)
                {
                    byte[] data = new byte[256];
                    int cnt = 256;
                    int x = 0;
                    int y = 0;
                    do
                    {
                        y = 0;
                        while (y < 32)
                        {
                            if (y % 8 == 0)
                            {
                                cnt--;
                            }
                            data[cnt] >>= 1;
                            if (bmp.GetPixel(x, y).ToArgb() == -16777216)
                            {
                                data[cnt] += 128;
                            }
                            y++;
                        }
                        pixels = $"0x{data[cnt + 2].ToString("X2")},{pixels}";
                        pixels = $"0x{data[cnt + 3].ToString("X2")},{pixels}";
                        pixels = $"0x{data[cnt + 0].ToString("X2")},{pixels}";
                        pixels = $"0x{data[cnt + 1].ToString("X2")},{pixels}";
                        x++;
                    } while (cnt > 0);
                }
            }
            catch { }
            return pixels;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if(openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                string filename = openFileDialog1.FileName;
                textBox1.Text = LoadBitmap(filename);
            }
        }
    }
}
