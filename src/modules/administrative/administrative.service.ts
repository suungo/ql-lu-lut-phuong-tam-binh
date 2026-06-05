import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class AdministrativeService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(Ward)
    private readonly wardRepo: Repository<Ward>,
  ) {}

  async getProvinces() {
    // 1. Kiểm tra database có dữ liệu tỉnh/thành chưa
    const count = await this.provinceRepo.count();
    if (count > 0) {
      // Đã có dữ liệu, lấy trực tiếp từ database
      return this.provinceRepo.find({ order: { name: 'ASC' } });
    }

    // 2. Nếu trống, gọi API ngoài để lấy và lưu lại
    console.log('🔄 Đang nạp danh sách Tỉnh/Thành từ API ngoài...');
    try {
      const res = await fetch('https://provinces.open-api.vn/api/p/');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) as any[];

      const provincesData = data.map((p: any) =>
        this.provinceRepo.create({ code: p.code, name: p.name }),
      );

      await this.provinceRepo.save(provincesData);
      console.log('✅ Đã lưu danh sách Tỉnh/Thành vào database!');
      return provincesData;
    } catch (error: any) {
      console.error(
        'Lỗi khi lấy danh sách Tỉnh/Thành từ API ngoài:',
        error.message,
      );
      return [];
    }
  }

  async getWards(provinceCode: number) {
    // 1. Kiểm tra xem đã lưu danh mục Phường/Xã cho Tỉnh/Thành này chưa
    const count = await this.wardRepo.count({ where: { provinceCode } });
    if (count > 0) {
      // Đã có dữ liệu, lấy trực tiếp từ database
      return this.wardRepo.find({
        where: { provinceCode },
        order: { name: 'ASC' },
      });
    }

    // 2. Nếu chưa có, gọi API ngoài để lấy chiều sâu cấp 3 (districts -> wards)
    console.log(
      `🔄 Đang nạp danh sách Phường/Xã cho tỉnh ${provinceCode} từ API ngoài...`,
    );
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`,
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) as any;
      const allWards: Ward[] = [];

      if (data && data.districts) {
        for (const d of data.districts) {
          if (d.wards) {
            for (const w of d.wards) {
              allWards.push(
                this.wardRepo.create({
                  code: w.code,
                  name: `${w.name} - ${d.name}`,
                  provinceCode,
                }),
              );
            }
          }
        }
      }

      if (allWards.length > 0) {
        await this.wardRepo.save(allWards);
        console.log(`✅ Đã lưu ${allWards.length} Phường/Xã vào database!`);
      }
      return allWards;
    } catch (error: any) {
      console.error(
        `Lỗi khi lấy danh sách Phường/Xã cho tỉnh ${provinceCode}:`,
        error.message,
      );
      return [];
    }
  }

  async seedWards() {
    console.log(
      '🔄 Đang bắt đầu đồng bộ danh sách Phường/Xã cho 34 tỉnh của bạn...',
    );
    try {
      // 1. Lấy toàn bộ 34 tỉnh từ database của bạn
      const myProvinces = await this.provinceRepo.find();
      if (myProvinces.length === 0) {
        return { message: 'Bảng provinces của bạn đang trống!' };
      }

      // 2. Gọi API ngoài để lấy toàn bộ tỉnh + huyện + xã Việt Nam (depth=3)
      const res = await fetch('https://provinces.open-api.vn/api/?depth=3');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const officialData = (await res.json()) as any[];

      let totalImported = 0;
      const allWardsToSave: Ward[] = [];

      // Hàm chuẩn hóa tên để so sánh (Ví dụ: "Thành Phố Hồ Chí Minh" -> "ho chi minh", "Tỉnh Dawsk Lắk" -> "dak lak")
      const normalizeName = (name: string) => {
        return name
          .toLowerCase()
          .replace(/tinh|thanh pho|thanh pho/g, '')
          .replace(/đ/g, 'd') // hỗ trợ xử lý Đắk Lắk / Dawsk Lắk
          .replace(/dawsk/g, '') // xử lý chữ "Dawsk Lắk" bị gõ sai
          .replace(/lak/g, 'lak')
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // loại bỏ dấu tiếng Việt
      };

      for (const myP of myProvinces) {
        const myPNameNormalized = normalizeName(myP.name);

        // Tìm tỉnh khớp tên trong danh sách chuẩn của Tổng cục Thống kê
        const officialP = officialData.find((op) => {
          const opNameNormalized = normalizeName(op.name);
          return (
            opNameNormalized.includes(myPNameNormalized) ||
            myPNameNormalized.includes(opNameNormalized)
          );
        });

        if (officialP && officialP.districts) {
          console.log(
            `➡️ Tìm thấy tỉnh khớp: ${myP.name} (Database ID: ${myP.code}) <=> ${officialP.name} (Official Code: ${officialP.code})`,
          );

          for (const d of officialP.districts) {
            if (d.wards) {
              for (const w of d.wards) {
                // Tạo đối tượng Ward với provinceCode là code của bạn (ví dụ: 16)
                const newWard = this.wardRepo.create({
                  code: w.code,
                  name: `${w.name} - ${d.name}`,
                  provinceCode: myP.code, // Trỏ về ID custom của bạn (1, 2... 34)
                });
                allWardsToSave.push(newWard);
              }
            }
          }
        } else {
          console.log(
            `❌ Không tìm thấy tỉnh khớp cho: ${myP.name} (Normalized: ${myPNameNormalized})`,
          );
        }
      }

      if (allWardsToSave.length > 0) {
        // Xóa sạch bảng wards cũ để tránh trùng lặp
        await this.wardRepo.clear();

        // Lưu theo lô (chunks) để tránh quá tải SQL
        const chunkSize = 500;
        for (let i = 0; i < allWardsToSave.length; i += chunkSize) {
          const chunk = allWardsToSave.slice(i, i + chunkSize);
          await this.wardRepo.save(chunk);
        }
        totalImported = allWardsToSave.length;
        console.log(`✅ Đã đồng bộ thành công ${totalImported} Phường/Xã!`);
      }

      return {
        message: `Đồng bộ thành công! Đã nạp ${totalImported} xã/phường cho các tỉnh của bạn.`,
        success: true,
      };
    } catch (error: any) {
      console.error('Lỗi khi đồng bộ xã/phường:', error.message);
      return { message: `Lỗi: ${error.message}`, success: false };
    }
  }
}
