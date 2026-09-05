import { DocumentTemplate } from '../types';

export interface OfficialDocumentPreviewData {
  headerState: string;
  ministry: string;
  directorate: string;
  institution: string;
  academicYear: string;
  referenceNo: string;
  dateStr: string;
  title: string;
  bodyHtml: string;
}

export function generateTemplatePreviewContent(
  template: DocumentTemplate,
  institutionName: string = 'متوسطة الشهيد زبانة',
  wilaya: string = 'الجزائر',
  academicYear: string = '2026/2027',
  principalName: string = 'الأستاذ أمحمد شامخة'
): OfficialDocumentPreviewData {
  const today = new Date().toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseHeader = {
    headerState: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    ministry: 'وزارة التربية الوطنية',
    directorate: `مديرية التربية لولاية ${wilaya}`,
    institution: institutionName,
    academicYear: `السنة الدراسية: ${academicYear}`,
    referenceNo: `رقم: ... / م.ش.ز / ${new Date().getFullYear()}`,
    dateStr: `في: ${today}`,
  };

  switch (template.id) {
    case 'tpl-admin-letter-1':
      return {
        ...baseHeader,
        title: 'إرسالية إدارية',
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <div class="flex justify-between font-bold border-b pb-2">
              <div>من: مدير المؤسسة (${principalName})</div>
              <div>إلى: السيد مدير التربية بالولاية (مصلحة التمدرس والامتحانات)</div>
            </div>
            <div><strong>الموضوع:</strong> إرسال الحصيلة الإدارية والتربوية للدخول المدرسي.</div>
            <div><strong>المرفقات:</strong> بطاقة تقنية + قائمة الأفواج التربوية والتأطير.</div>
            <p>يشرفني أن أوافي سيادتكم المحترمة رفقة هذا التقرير بالحصيلة المفصلة للدخول المدرسي بالمؤسسة، والتي تشمل تعداد التلاميذ المتمدرسين حسب كل مستوى، ومخطط توزيع الأفواج على القاعات، وتغطية حصص التدريس في كافة المواد التعليمية.</p>
            <p>كما نحيطكم علماً بأن الانطلاق الفعلي للدراسة تم في ظروف تنظيمية محكمة مع تسجيل استقرار تام في التأطير البيداغوجي.</p>
            <div class="pt-6 flex justify-end">
              <div class="text-center">
                <div class="font-bold">مدير المتوسطة</div>
                <div class="text-xs text-slate-500 mt-8">(الختم والتوقيع)</div>
              </div>
            </div>
          </div>
        `,
      };

    case 'tpl-work-cert-1':
      return {
        ...baseHeader,
        title: 'شهـــادة عمـــل',
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-center font-bold text-base pb-3 underline">شهادة عمل وإثبات صفة موظف</p>
            <p>يشهد الموقع أسفله، السيد <strong>${principalName}</strong>، مدير <strong>${institutionName}</strong>، بأن:</p>
            <div class="bg-slate-50 p-4 rounded-xl space-y-2 border">
              <div>السيد(ة): ............................................................................</div>
              <div>المولود(ة) بتاريخ: ................................... بـ: ............................</div>
              <div>الرتبة: أستاذ التعليم المتوسط / موظف إداري</div>
              <div>المادة / الوظيفة: ..................................................................</div>
              <div>تاريخ أول تعيين بالقطاع: ...........................................................</div>
            </div>
            <p>يمارس مهامه بصفة مستمرة ومنتظمة بالمؤسسة حتى تاريخه، ولم تصدر في حقه أي عقوبة تأديبية.</p>
            <p>سلمت هذه الشهادة للمعني بالأمر لاستعمالها في حدود ما يسمح به القانون والتشريع المعمول به.</p>
            <div class="pt-8 flex justify-between items-end">
              <div>حرر بـ ${wilaya} في: ${today}</div>
              <div class="text-center">
                <div class="font-bold">مدير المؤسسة</div>
                <div class="text-xs text-slate-500 mt-10">${principalName}</div>
              </div>
            </div>
          </div>
        `,
      };

    case 'tpl-school-cert-1':
      return {
        ...baseHeader,
        title: 'شهـــادة مدرسيـــة',
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-center font-bold text-base pb-2 underline">شهادة تمدرس نظامي</p>
            <p>يشهد مدير <strong>${institutionName}</strong> بأن التلميذ(ة):</p>
            <div class="bg-slate-50 p-4 rounded-xl space-y-2 border">
              <div>الاسم واللقب: ......................................................................</div>
              <div>تاريخ ومكان الازدياد: ..............................................................</div>
              <div>رقم التعريف المدرسي الوطني (NUM): ...............................................</div>
              <div>مسجل(ة) بالسنة: الرابعة / الثالثة / الثانية / الأولى متوسط</div>
              <div>الفوج التربوي: ......................... للعام الدراسي: ${academicYear}</div>
            </div>
            <p>يتابع دراسته بصفة منتظمة حتى تاريخ تحرير هذه الشهادة.</p>
            <p>سلمت هذه الشهادة بطلب من ولي التلميذ لتقديمها للملفات الإدارية والاجتماعية.</p>
            <div class="pt-6 flex justify-between items-end">
              <div>حرر في: ${today}</div>
              <div class="text-center">
                <div class="font-bold">إدارة المؤسسة</div>
                <div class="text-xs text-slate-500 mt-8">(الختم الرسمي)</div>
              </div>
            </div>
          </div>
        `,
      };

    case 'tpl-guidance-min-1':
      return {
        ...baseHeader,
        title: 'محضر تنصيب مجلس التربية والتسيير',
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-center font-bold text-base underline">محضر تنصيب مجلس التربية والتسيير للدورة السنوية</p>
            <p>في يوم: ....................................... على الساعة: ...................، اجتمع أعضاء مجلس التربية والتسيير لمتوسطة ${institutionName} تحت رئاسة السيد مدير المؤسسة (${principalName})، وبحضور الأعضاء القانونيين:</p>
            <ul class="list-disc pr-6 space-y-1 text-xs">
              <li>السيد ناظر المتوسطة (عضواً مقرراً)</li>
              <li>السيد مقتصد المؤسسة (المسير المالي)</li>
              <li>مستشار التربية</li>
              <li>ممثلو أساتذة التعليم المتوسط المنتخبون</li>
              <li>ممثلو الطاقم الإداري والعمال المهنيين</li>
              <li>رئيس جمعية أولياء التلاميذ</li>
            </ul>
            <p><strong>جدول الأعمال:</strong> دراسة مشروع النظام الداخلي، ومناقشة مشروع الميزانية للسنة المالية، وضبط التدابير الأمنية والصحية.</p>
            <div class="pt-6 flex justify-between items-end">
              <div>الأعضاء الحاضرون (التوقيعات)</div>
              <div class="text-center font-bold">رئيس المجلس / مدير المتوسطة</div>
            </div>
          </div>
        `,
      };

    case 'tpl-pedagogic-min-1':
      return {
        ...baseHeader,
        title: 'محضر اجتماع مجلس التعليم في انطلاق السنة الدراسية',
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-center font-bold text-base underline">محضر جلسة مجلس التعليم الافتتاحي</p>
            <p>بتاريخ ............................. انعقد مجلس التعليم برئاسة السيد المدير <strong>${principalName}</strong> وبمعية السيد ناظر المتوسطة وأساتذة المواد التعليمية، وتم تدارس النقاط التالية:</p>
            <ol class="list-decimal pr-6 space-y-1.5 text-xs">
              <li>قراءة وتحليل المناشير الوزارية الخاصة بالدخول المدرسي ${academicYear}.</li>
              <li>عرض التنظيم التربوي والمواقيت وتوزيع الحصص الأسبوعية.</li>
              <li>ضبط جدول رزنامة جلسات التنسيق البيداغوجي الشهرية لكل مادة.</li>
              <li>التأكيد على العمل المشترك لمكافحة التسرب المدرسي ومتابعة الفروق الفردية.</li>
              <li>برمجة فروض المراقبة المستمرة والتقويم التشخيصي لبداية الفصل.</li>
            </ol>
            <div class="pt-6 flex justify-between items-end">
              <div>السيد ناظر المتوسطة (مقرراً)</div>
              <div class="text-center font-bold">رئيس المجلس / السيد المدير</div>
            </div>
          </div>
        `,
      };

    default:
      return {
        ...baseHeader,
        title: template.title,
        bodyHtml: `
          <div class="space-y-4 text-sm leading-relaxed">
            <p class="text-center font-bold text-base underline">${template.title}</p>
            <div class="p-4 bg-slate-50 border rounded-xl space-y-2">
              <div><strong>نوع الوثيقة:</strong> ${template.fileName}</div>
              <div><strong>التصنيف:</strong> ${template.category}</div>
              <div><strong>الوصف الإداري:</strong> ${template.description || 'وثيقة إدارية معتمدة بالمؤسسة'}</div>
              <div><strong>تاريخ الإدراج:</strong> ${template.uploadedAt}</div>
            </div>
            <p>هذا النموذج معتمد رسمياً ومعد وفق التشريع المدرسي الجزائري المعمول به في قطاع التربية الوطنية، وجاهز للطباعة أو التعديل المباشر.</p>
            <div class="pt-8 flex justify-end">
              <div class="text-center">
                <div class="font-bold">إدارة المؤسسة: ${institutionName}</div>
                <div class="text-xs text-slate-500 mt-6">${principalName}</div>
              </div>
            </div>
          </div>
        `,
      };
  }
}

export function downloadDocumentTemplateFile(template: DocumentTemplate, institutionName: string) {
  // If template already has a base64 dataUrl, download it directly
  if (template.dataUrl) {
    const a = document.createElement('a');
    a.href = template.dataUrl;
    a.download = template.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Otherwise generate downloadable doc content
  const preview = generateTemplatePreviewContent(template, institutionName);
  const textContent = `
================================================================================
الجمهورية الجزائرية الديمقراطية الشعبية
وزارة التربية الوطنية
${preview.directorate}
${preview.institution}
${preview.academicYear}
${preview.referenceNo}
${preview.dateStr}
================================================================================
العنوان: ${template.title}
التصنيف: ${template.category}

${template.description || ''}

محتوى النموذج الرسمي:
${preview.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}

مدير المتوسطة: الأستاذ أمحمد شامخة
================================================================================
`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = template.fileName.replace(/\.docx|\.pdf/, '.doc');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
